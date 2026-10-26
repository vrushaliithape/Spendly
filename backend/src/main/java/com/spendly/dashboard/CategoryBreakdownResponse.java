package com.spendly.dashboard;

import java.math.BigDecimal;

public class CategoryBreakdownResponse {

    private String category;
    private BigDecimal amount;
    private double percentage;
    private int transactionCount;

    public CategoryBreakdownResponse() {
    }

    public CategoryBreakdownResponse(String category, BigDecimal amount, double percentage, int transactionCount) {
        this.category = category;
        this.amount = amount;
        this.percentage = percentage;
        this.transactionCount = transactionCount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public int getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(int transactionCount) {
        this.transactionCount = transactionCount;
    }
}
