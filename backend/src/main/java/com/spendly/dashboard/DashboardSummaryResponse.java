package com.spendly.dashboard;

import java.math.BigDecimal;

public class DashboardSummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netRemaining;
    private double savingsRate;
    private int month;
    private int year;
    private boolean hasPreviousMonthData;
    private Double incomeChangePercent;
    private Double expenseChangePercent;
    private Double netChangePercent;
    private String currency;

    public DashboardSummaryResponse() {
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getNetRemaining() {
        return netRemaining;
    }

    public void setNetRemaining(BigDecimal netRemaining) {
        this.netRemaining = netRemaining;
    }

    public double getSavingsRate() {
        return savingsRate;
    }

    public void setSavingsRate(double savingsRate) {
        this.savingsRate = savingsRate;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public boolean isHasPreviousMonthData() {
        return hasPreviousMonthData;
    }

    public void setHasPreviousMonthData(boolean hasPreviousMonthData) {
        this.hasPreviousMonthData = hasPreviousMonthData;
    }

    public Double getIncomeChangePercent() {
        return incomeChangePercent;
    }

    public void setIncomeChangePercent(Double incomeChangePercent) {
        this.incomeChangePercent = incomeChangePercent;
    }

    public Double getExpenseChangePercent() {
        return expenseChangePercent;
    }

    public void setExpenseChangePercent(Double expenseChangePercent) {
        this.expenseChangePercent = expenseChangePercent;
    }

    public Double getNetChangePercent() {
        return netChangePercent;
    }

    public void setNetChangePercent(Double netChangePercent) {
        this.netChangePercent = netChangePercent;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
