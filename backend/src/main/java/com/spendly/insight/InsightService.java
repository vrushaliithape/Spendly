package com.spendly.insight;

import com.spendly.budget.Budget;
import com.spendly.budget.BudgetRepository;
import com.spendly.savings.SavingsGoal;
import com.spendly.savings.SavingsGoalRepository;
import com.spendly.transaction.Transaction;
import com.spendly.transaction.TransactionRepository;
import com.spendly.transaction.TransactionType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InsightService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository savingsGoalRepository;

    public InsightService(TransactionRepository transactionRepository,
                          BudgetRepository budgetRepository,
                          SavingsGoalRepository savingsGoalRepository) {
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.savingsGoalRepository = savingsGoalRepository;
    }

    public List<InsightResponse> generateInsights(Long userId, int month, int year) {
        List<InsightResponse> insights = new ArrayList<>();

        YearMonth currentYm = YearMonth.of(year, month);
        LocalDate start = currentYm.atDay(1);
        LocalDate end = currentYm.atEndOfMonth();

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(userId, start, end);

        // Rule 1: No activity this month
        if (transactions.isEmpty()) {
            insights.add(new InsightResponse(
                    "empty-month",
                    "INFO",
                    "No transactions recorded for " + currentYm.getMonth().name(),
                    "Add your income and expenses to unlock budget tracking and smart savings analysis.",
                    "Rule: User has 0 transactions recorded in the selected calendar month.",
                    "General"
            ));
            return insights;
        }

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        List<Transaction> expenses = new ArrayList<>();

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(t.getAmount());
                expenses.add(t);
            }
        }

        // Rule 2: Savings Rate Evaluation
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal net = totalIncome.subtract(totalExpense);
            double rate = net.multiply(BigDecimal.valueOf(100))
                    .divide(totalIncome, 2, RoundingMode.HALF_UP)
                    .doubleValue();

            if (rate >= 30.0) {
                insights.add(new InsightResponse(
                        "savings-rate-high",
                        "SUCCESS",
                        "Excellent Savings Rate (" + String.format("%.1f", rate) + "%)",
                        "You are saving " + String.format("%.1f", rate) + "% of your monthly income, exceeding the recommended 20% benchmark.",
                        "Rule: Net savings / Total income is 30% or higher.",
                        "Savings"
                ));
            } else if (rate < 0) {
                insights.add(new InsightResponse(
                        "deficit-warning",
                        "WARNING",
                        "Spending Exceeds Income",
                        "Your expenses exceed your income this month by " + net.abs().setScale(2, RoundingMode.HALF_UP) + ". Review non-essential purchases to restore positive cash flow.",
                        "Rule: Total expenses exceed total income for the current month.",
                        "Cash Flow"
                ));
            }
        }

        // Rule 3: Largest Expense Category
        if (!expenses.isEmpty()) {
            Map<String, BigDecimal> categorySums = expenses.stream()
                    .collect(Collectors.groupingBy(
                            Transaction::getCategory,
                            Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                    ));

            Map.Entry<String, BigDecimal> topCategory = categorySums.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .orElse(null);

            if (topCategory != null && totalExpense.compareTo(BigDecimal.ZERO) > 0) {
                double pct = topCategory.getValue().multiply(BigDecimal.valueOf(100))
                        .divide(totalExpense, 2, RoundingMode.HALF_UP)
                        .doubleValue();

                if (pct >= 30.0) {
                    insights.add(new InsightResponse(
                            "top-expense-" + topCategory.getKey().toLowerCase(),
                            "TIP",
                            "High Concentration in " + topCategory.getKey(),
                            topCategory.getKey() + " accounts for " + String.format("%.1f", pct) + "% of your expenses (" + topCategory.getValue().setScale(2, RoundingMode.HALF_UP) + "). Trimming here will have the greatest impact.",
                            "Rule: A single expense category consumes 30% or more of total monthly spending.",
                            topCategory.getKey()
                    ));
                }
            }

            // Rule 4: Category Surge Compared to Previous Month
            YearMonth prevYm = currentYm.minusMonths(1);
            List<Transaction> prevTransactions = transactionRepository
                    .findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(
                            userId, prevYm.atDay(1), prevYm.atEndOfMonth());

            Map<String, BigDecimal> prevCategorySums = prevTransactions.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .collect(Collectors.groupingBy(
                            Transaction::getCategory,
                            Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                    ));

            for (Map.Entry<String, BigDecimal> currCat : categorySums.entrySet()) {
                BigDecimal prevAmount = prevCategorySums.get(currCat.getKey());
                if (prevAmount != null && prevAmount.compareTo(BigDecimal.valueOf(100)) > 0) {
                    double increase = currCat.getValue().subtract(prevAmount)
                            .multiply(BigDecimal.valueOf(100))
                            .divide(prevAmount, 2, RoundingMode.HALF_UP)
                            .doubleValue();

                    if (increase >= 25.0) {
                        insights.add(new InsightResponse(
                                "surge-" + currCat.getKey().toLowerCase(),
                                "WARNING",
                                currCat.getKey() + " Spending Increased",
                                "Your " + currCat.getKey() + " spending jumped by " + String.format("%.0f", increase) + "% compared with last month (" + prevAmount.setScale(2, RoundingMode.HALF_UP) + " → " + currCat.getValue().setScale(2, RoundingMode.HALF_UP) + ").",
                                "Rule: Category expense increased by 25% or more over previous month.",
                                currCat.getKey()
                        ));
                    }
                }
            }
        }

        // Rule 5: Budget Limit Thresholds
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        for (Budget b : budgets) {
            BigDecimal spent = expenses.stream()
                    .filter(t -> t.getCategory().equalsIgnoreCase(b.getCategory()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (b.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
                double usedPct = spent.multiply(BigDecimal.valueOf(100))
                        .divide(b.getMonthlyLimit(), 2, RoundingMode.HALF_UP)
                        .doubleValue();

                if (usedPct >= 100.0) {
                    insights.add(new InsightResponse(
                            "budget-exceeded-" + b.getId(),
                            "WARNING",
                            b.getCategory() + " Budget Exceeded",
                            "You have exceeded your " + b.getCategory() + " budget limit by " + spent.subtract(b.getMonthlyLimit()).setScale(2, RoundingMode.HALF_UP) + ".",
                            "Rule: Spending in category exceeded 100% of set monthly budget.",
                            b.getCategory()
                    ));
                } else if (usedPct >= 80.0) {
                    insights.add(new InsightResponse(
                            "budget-warning-" + b.getId(),
                            "TIP",
                            b.getCategory() + " Budget Alert",
                            "You have consumed " + String.format("%.1f", usedPct) + "% of your " + b.getCategory() + " budget. " + b.getMonthlyLimit().subtract(spent).setScale(2, RoundingMode.HALF_UP) + " remaining.",
                            "Rule: Spending reached 80% or more of monthly budget limit.",
                            b.getCategory()
                    ));
                }
            }
        }

        // Rule 6: Savings Goal Milestones
        List<SavingsGoal> goals = savingsGoalRepository.findByUserIdAndStatus(userId, "IN_PROGRESS");
        for (SavingsGoal goal : goals) {
            if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
                double pct = goal.getCurrentAmount().multiply(BigDecimal.valueOf(100))
                        .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP)
                        .doubleValue();

                if (pct >= 75.0) {
                    insights.add(new InsightResponse(
                            "goal-close-" + goal.getId(),
                            "SUCCESS",
                            "Goal Almost Reached: " + goal.getName(),
                            "You are " + String.format("%.1f", pct) + "% of the way to your '" + goal.getName() + "' target! Just " + goal.getTargetAmount().subtract(goal.getCurrentAmount()).setScale(2, RoundingMode.HALF_UP) + " remaining.",
                            "Rule: Savings goal is 75% or more completed and still in progress.",
                            "Savings Goal"
                    ));
                }
            }
        }

        return insights;
    }
}
