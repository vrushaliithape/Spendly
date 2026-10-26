package com.spendly;

import com.spendly.auth.AuthResponse;
import com.spendly.auth.AuthService;
import com.spendly.auth.RegisterRequest;
import com.spendly.budget.BudgetRequest;
import com.spendly.budget.BudgetResponse;
import com.spendly.budget.BudgetService;
import com.spendly.dashboard.DashboardService;
import com.spendly.dashboard.DashboardSummaryResponse;
import com.spendly.exception.ResourceNotFoundException;
import com.spendly.savings.ContributionRequest;
import com.spendly.savings.ContributionResponse;
import com.spendly.savings.SavingsGoalRequest;
import com.spendly.savings.SavingsGoalResponse;
import com.spendly.savings.SavingsService;
import com.spendly.transaction.TransactionRequest;
import com.spendly.transaction.TransactionResponse;
import com.spendly.transaction.TransactionService;
import com.spendly.transaction.TransactionType;
import com.spendly.user.User;
import com.spendly.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite:target/spendly-test.db",
        "spendly.jwt.secret=test_secret_key_at_least_256_bits_for_spendly_testing_purposes_only!"
})
class SpendlyApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private SavingsService savingsService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long userId1;
    private Long userId2;

    @BeforeEach
    void setUp() {
        String email1 = "alice_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest reg1 = new RegisterRequest();
        reg1.setFullName("Alice Finance");
        reg1.setEmail(email1);
        reg1.setPassword("Password123!");
        reg1.setConfirmPassword("Password123!");
        AuthResponse res1 = authService.register(reg1);
        userId1 = res1.getId();

        String email2 = "bob_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest reg2 = new RegisterRequest();
        reg2.setFullName("Bob Saver");
        reg2.setEmail(email2);
        reg2.setPassword("Password123!");
        reg2.setConfirmPassword("Password123!");
        AuthResponse res2 = authService.register(reg2);
        userId2 = res2.getId();
    }

    @Test
    void contextLoads() {
        assertNotNull(userRepository);
        assertNotNull(authService);
    }

    @Test
    void testUserRegistrationAndPasswordHashing() {
        Optional<User> savedUserOpt = userRepository.findById(userId1);
        assertTrue(savedUserOpt.isPresent());

        User savedUser = savedUserOpt.get();
        assertNotEquals("Password123!", savedUser.getPasswordHash());
        assertTrue(passwordEncoder.matches("Password123!", savedUser.getPasswordHash()));
        assertEquals("INR", savedUser.getCurrency());
    }

    @Test
    void testTransactionCreationAndUserIsolation() {
        LocalDate today = LocalDate.now();

        TransactionRequest req = new TransactionRequest();
        req.setType(TransactionType.EXPENSE);
        req.setAmount(new BigDecimal("450.00"));
        req.setCategory("Food");
        req.setDescription("Team lunch");
        req.setTransactionDate(today);
        req.setPaymentMethod("UPI");

        TransactionResponse created = transactionService.createTransaction(userId1, req);
        assertNotNull(created.getId());
        assertEquals(new BigDecimal("450.00"), created.getAmount());

        // Verify Alice can fetch it
        TransactionResponse fetched = transactionService.getTransactionById(userId1, created.getId());
        assertEquals("Team lunch", fetched.getDescription());

        // Verify Bob CANNOT fetch Alice's transaction (User Isolation Check!)
        assertThrows(ResourceNotFoundException.class, () -> {
            transactionService.getTransactionById(userId2, created.getId());
        });
    }

    @Test
    void testDashboardTotalsCalculation() {
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();

        // Income: 50,000
        TransactionRequest inc = new TransactionRequest();
        inc.setType(TransactionType.INCOME);
        inc.setAmount(new BigDecimal("50000.00"));
        inc.setCategory("Salary");
        inc.setDescription("Monthly Salary");
        inc.setTransactionDate(today);
        transactionService.createTransaction(userId1, inc);

        // Expense 1: 15,000
        TransactionRequest exp1 = new TransactionRequest();
        exp1.setType(TransactionType.EXPENSE);
        exp1.setAmount(new BigDecimal("15000.00"));
        exp1.setCategory("Rent");
        exp1.setDescription("Apartment rent");
        exp1.setTransactionDate(today);
        transactionService.createTransaction(userId1, exp1);

        // Expense 2: 5,000
        TransactionRequest exp2 = new TransactionRequest();
        exp2.setType(TransactionType.EXPENSE);
        exp2.setAmount(new BigDecimal("5000.00"));
        exp2.setCategory("Food");
        exp2.setDescription("Groceries");
        exp2.setTransactionDate(today);
        transactionService.createTransaction(userId1, exp2);

        DashboardSummaryResponse summary = dashboardService.getSummary(userId1, month, year);
        assertEquals(0, new BigDecimal("50000.00").compareTo(summary.getTotalIncome()));
        assertEquals(0, new BigDecimal("20000.00").compareTo(summary.getTotalExpenses()));
        assertEquals(0, new BigDecimal("30000.00").compareTo(summary.getNetRemaining()));

        // Savings rate = (30000 / 50000) * 100 = 60.0%
        assertEquals(60.0, summary.getSavingsRate(), 0.01);
    }

    @Test
    void testBudgetTrackingAndAlertThresholds() {
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();

        BudgetRequest budgetReq = new BudgetRequest();
        budgetReq.setCategory("Shopping");
        budgetReq.setMonthlyLimit(new BigDecimal("10000.00"));
        budgetReq.setMonth(month);
        budgetReq.setYear(year);

        BudgetResponse budgetRes = budgetService.createBudget(userId1, budgetReq);
        assertEquals("NORMAL", budgetRes.getAlertStatus());

        // Add 8,500 expense -> 85% used -> alert status WARNING
        TransactionRequest exp = new TransactionRequest();
        exp.setType(TransactionType.EXPENSE);
        exp.setAmount(new BigDecimal("8500.00"));
        exp.setCategory("Shopping");
        exp.setDescription("Online shopping");
        exp.setTransactionDate(today);
        transactionService.createTransaction(userId1, exp);

        List<BudgetResponse> budgets = budgetService.getBudgets(userId1, month, year);
        BudgetResponse shoppingBudget = budgets.stream()
                .filter(b -> b.getCategory().equalsIgnoreCase("Shopping"))
                .findFirst().orElseThrow();

        assertEquals(0, new BigDecimal("8500.00").compareTo(shoppingBudget.getSpentAmount()));
        assertEquals(0, new BigDecimal("1500.00").compareTo(shoppingBudget.getRemainingAmount()));
        assertEquals("WARNING", shoppingBudget.getAlertStatus());
    }

    @Test
    void testSavingsGoalAndAtomicContribution() {
        SavingsGoalRequest goalReq = new SavingsGoalRequest();
        goalReq.setName("Emergency Fund");
        goalReq.setTargetAmount(new BigDecimal("100000.00"));
        goalReq.setDescription("6 months of living expenses");

        SavingsGoalResponse goal = savingsService.createGoal(userId1, goalReq);
        assertNotNull(goal.getId());
        assertEquals(BigDecimal.ZERO, goal.getCurrentAmount());
        assertEquals("IN_PROGRESS", goal.getStatus());

        // Add contribution: 25,000
        ContributionRequest contribReq = new ContributionRequest();
        contribReq.setAmount(new BigDecimal("25000.00"));
        contribReq.setNote("First milestone contribution");
        ContributionResponse contrib = savingsService.addContribution(userId1, goal.getId(), contribReq);
        assertNotNull(contrib.getId());

        SavingsGoalResponse updatedGoal = savingsService.getGoalById(userId1, goal.getId());
        assertEquals(0, new BigDecimal("25000.00").compareTo(updatedGoal.getCurrentAmount()));
        assertEquals(0, new BigDecimal("75000.00").compareTo(updatedGoal.getRemainingAmount()));
        assertEquals(25.0, updatedGoal.getPercentageCompleted(), 0.01);
    }
}
