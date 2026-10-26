package com.spendly.dashboard;

import java.math.BigDecimal;

public class MonthlyCashFlowResponse {

    private String monthName;
    private int month;
    private int year;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal netSavings;

    public MonthlyCashFlowResponse() {
    }

    public MonthlyCashFlowResponse(String monthName, int month, int year, BigDecimal income, BigDecimal expense, BigDecimal netSavings) {
        this.monthName = monthName;
        this.month = month;
        this.year = year;
        this.income = income;
        this.expense = expense;
        this.netSavings = netSavings;
    }

    public String getMonthName() {
        return monthName;
    }

    public void setMonthName(String monthName) {
        this.monthName = monthName;
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

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }

    public BigDecimal getExpense() {
        return expense;
    }

    public void setExpense(BigDecimal expense) {
        this.expense = expense;
    }

    public BigDecimal getNetSavings() {
        return netSavings;
    }

    public void setNetSavings(BigDecimal netSavings) {
        this.netSavings = netSavings;
    }
}
