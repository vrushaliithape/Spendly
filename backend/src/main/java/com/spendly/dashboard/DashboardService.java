package com.spendly.dashboard;

import com.spendly.exception.ResourceNotFoundException;
import com.spendly.transaction.Transaction;
import com.spendly.transaction.TransactionRepository;
import com.spendly.transaction.TransactionResponse;
import com.spendly.transaction.TransactionType;
import com.spendly.user.User;
import com.spendly.user.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public DashboardService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public DashboardSummaryResponse getSummary(Long userId, int month, int year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        YearMonth currentYm = YearMonth.of(year, month);
        LocalDate start = currentYm.atDay(1);
        LocalDate end = currentYm.atEndOfMonth();

        List<Transaction> currentTransactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(userId, start, end);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Transaction t : currentTransactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                totalExpenses = totalExpenses.add(t.getAmount());
            }
        }

        BigDecimal netRemaining = totalIncome.subtract(totalExpenses);

        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netRemaining.multiply(BigDecimal.valueOf(100))
                    .divide(totalIncome, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setTotalIncome(totalIncome);
        response.setTotalExpenses(totalExpenses);
        response.setNetRemaining(netRemaining);
        response.setSavingsRate(savingsRate);
        response.setMonth(month);
        response.setYear(year);
        response.setCurrency(user.getCurrency());

        // Compare with previous month if previous month data exists
        YearMonth prevYm = currentYm.minusMonths(1);
        LocalDate prevStart = prevYm.atDay(1);
        LocalDate prevEnd = prevYm.atEndOfMonth();

        List<Transaction> prevTransactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(userId, prevStart, prevEnd);

        if (!prevTransactions.isEmpty()) {
            response.setHasPreviousMonthData(true);

            BigDecimal prevIncome = BigDecimal.ZERO;
            BigDecimal prevExpenses = BigDecimal.ZERO;

            for (Transaction t : prevTransactions) {
                if (t.getType() == TransactionType.INCOME) {
                    prevIncome = prevIncome.add(t.getAmount());
                } else if (t.getType() == TransactionType.EXPENSE) {
                    prevExpenses = prevExpenses.add(t.getAmount());
                }
            }

            BigDecimal prevNet = prevIncome.subtract(prevExpenses);

            response.setIncomeChangePercent(calculatePercentChange(prevIncome, totalIncome));
            response.setExpenseChangePercent(calculatePercentChange(prevExpenses, totalExpenses));
            response.setNetChangePercent(calculatePercentChange(prevNet, netRemaining));
        } else {
            response.setHasPreviousMonthData(false);
            response.setIncomeChangePercent(null);
            response.setExpenseChangePercent(null);
            response.setNetChangePercent(null);
        }

        return response;
    }

    public List<CategoryBreakdownResponse> getCategoryBreakdown(Long userId, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Transaction> expenses = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(userId, start, end)
                .stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .toList();

        if (expenses.isEmpty()) {
            return Collections.emptyList();
        }

        BigDecimal totalExpense = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, List<Transaction>> grouped = expenses.stream()
                .collect(Collectors.groupingBy(Transaction::getCategory));

        List<CategoryBreakdownResponse> list = new ArrayList<>();
        for (Map.Entry<String, List<Transaction>> entry : grouped.entrySet()) {
            String category = entry.getKey();
            List<Transaction> catList = entry.getValue();

            BigDecimal catAmount = catList.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double percentage = 0.0;
            if (totalExpense.compareTo(BigDecimal.ZERO) > 0) {
                percentage = catAmount.multiply(BigDecimal.valueOf(100))
                        .divide(totalExpense, 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            list.add(new CategoryBreakdownResponse(category, catAmount, percentage, catList.size()));
        }

        list.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));
        return list;
    }

    public List<MonthlyCashFlowResponse> getMonthlyCashFlow(Long userId, int monthsCount) {
        if (monthsCount <= 0 || monthsCount > 24) {
            monthsCount = 6;
        }

        YearMonth currentYm = YearMonth.now();
        List<MonthlyCashFlowResponse> cashFlowList = new ArrayList<>();

        for (int i = monthsCount - 1; i >= 0; i--) {
            YearMonth targetYm = currentYm.minusMonths(i);
            LocalDate start = targetYm.atDay(1);
            LocalDate end = targetYm.atEndOfMonth();

            List<Transaction> transactions = transactionRepository
                    .findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(userId, start, end);

            BigDecimal income = BigDecimal.ZERO;
            BigDecimal expense = BigDecimal.ZERO;

            for (Transaction t : transactions) {
                if (t.getType() == TransactionType.INCOME) {
                    income = income.add(t.getAmount());
                } else if (t.getType() == TransactionType.EXPENSE) {
                    expense = expense.add(t.getAmount());
                }
            }

            BigDecimal net = income.subtract(expense);
            String monthName = targetYm.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            cashFlowList.add(new MonthlyCashFlowResponse(
                    monthName + " " + targetYm.getYear(),
                    targetYm.getMonthValue(),
                    targetYm.getYear(),
                    income,
                    expense,
                    net
            ));
        }

        return cashFlowList;
    }

    public List<TransactionResponse> getRecentTransactions(Long userId) {
        return transactionRepository.findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(userId)
                .stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    private Double calculatePercentChange(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            if (current != null && current.compareTo(BigDecimal.ZERO) > 0) {
                return 100.0;
            }
            return 0.0;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous.abs(), 2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
