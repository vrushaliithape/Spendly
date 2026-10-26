package com.spendly.budget;

import com.spendly.exception.BadRequestException;
import com.spendly.exception.ResourceNotFoundException;
import com.spendly.transaction.Transaction;
import com.spendly.transaction.TransactionRepository;
import com.spendly.transaction.TransactionType;
import com.spendly.user.User;
import com.spendly.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         UserRepository userRepository,
                         TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        if (budgetRepository.existsByUserIdAndCategoryIgnoreCaseAndMonthAndYear(
                userId, request.getCategory().trim(), request.getMonth(), request.getYear())) {
            throw new BadRequestException("A budget for category '" + request.getCategory() +
                    "' already exists for " + request.getMonth() + "/" + request.getYear());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Budget budget = new Budget(
                user,
                request.getCategory().trim(),
                request.getMonthlyLimit(),
                request.getMonth(),
                request.getYear()
        );

        Budget saved = budgetRepository.save(budget);
        BigDecimal spent = calculateSpent(userId, saved.getCategory(), saved.getMonth(), saved.getYear());
        return BudgetResponse.of(saved, spent);
    }

    public List<BudgetResponse> getBudgets(Long userId, int month, int year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Transaction> monthExpenses = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(
                userId, start, end).stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .toList();

        Map<String, BigDecimal> spentByCategory = monthExpenses.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().toLowerCase().trim(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<BudgetResponse> responses = new ArrayList<>();
        for (Budget b : budgets) {
            BigDecimal spent = spentByCategory.getOrDefault(b.getCategory().toLowerCase().trim(), BigDecimal.ZERO);
            responses.add(BudgetResponse.of(b, spent));
        }

        return responses;
    }

    public BudgetResponse getBudgetById(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found or unauthorized"));
        BigDecimal spent = calculateSpent(userId, budget.getCategory(), budget.getMonth(), budget.getYear());
        return BudgetResponse.of(budget, spent);
    }

    @Transactional
    public BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found or unauthorized"));

        // If category, month, or year changed, check for duplicates
        boolean categoryChanged = !budget.getCategory().equalsIgnoreCase(request.getCategory().trim());
        boolean periodChanged = budget.getMonth() != request.getMonth() || budget.getYear() != request.getYear();

        if ((categoryChanged || periodChanged) &&
                budgetRepository.existsByUserIdAndCategoryIgnoreCaseAndMonthAndYear(
                        userId, request.getCategory().trim(), request.getMonth(), request.getYear())) {
            throw new BadRequestException("A budget for category '" + request.getCategory() +
                    "' already exists for " + request.getMonth() + "/" + request.getYear());
        }

        budget.setCategory(request.getCategory().trim());
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        Budget updated = budgetRepository.save(budget);
        BigDecimal spent = calculateSpent(userId, updated.getCategory(), updated.getMonth(), updated.getYear());
        return BudgetResponse.of(updated, spent);
    }

    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found or unauthorized"));
        budgetRepository.delete(budget);
    }

    private BigDecimal calculateSpent(Long userId, String category, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return transactionRepository.findByUserIdAndTypeAndCategoryAndDateRange(
                userId, TransactionType.EXPENSE, category, start, end)
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
