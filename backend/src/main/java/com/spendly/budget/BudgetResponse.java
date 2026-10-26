package com.spendly.budget;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class BudgetResponse {

    private Long id;
    private String category;
    private BigDecimal monthlyLimit;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private double percentageUsed;
    private int month;
    private int year;
    private String alertStatus; // NORMAL, WARNING, EXCEEDED
    private String alertMessage;

    public BudgetResponse() {
    }

    public static BudgetResponse of(Budget budget, BigDecimal spent) {
        BudgetResponse response = new BudgetResponse();
        response.setId(budget.getId());
        response.setCategory(budget.getCategory());
        response.setMonthlyLimit(budget.getMonthlyLimit());
        response.setMonth(budget.getMonth());
        response.setYear(budget.getYear());

        BigDecimal actualSpent = spent != null ? spent : BigDecimal.ZERO;
        response.setSpentAmount(actualSpent);

        BigDecimal remaining = budget.getMonthlyLimit().subtract(actualSpent);
        response.setRemainingAmount(remaining);

        if (budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
            double percent = actualSpent.multiply(BigDecimal.valueOf(100))
                    .divide(budget.getMonthlyLimit(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
            response.setPercentageUsed(percent);

            if (percent >= 100.0) {
                response.setAlertStatus("EXCEEDED");
                response.setAlertMessage("Exceeded by " + actualSpent.subtract(budget.getMonthlyLimit()).setScale(2, RoundingMode.HALF_UP));
            } else if (percent >= 80.0) {
                response.setAlertStatus("WARNING");
                response.setAlertMessage("Warning: " + String.format("%.1f", percent) + "% of budget used");
            } else {
                response.setAlertStatus("NORMAL");
                response.setAlertMessage("On track (" + String.format("%.1f", percent) + "% used)");
            }
        } else {
            response.setPercentageUsed(0.0);
            response.setAlertStatus("NORMAL");
            response.setAlertMessage("No limit set");
        }

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getMonthlyLimit() {
        return monthlyLimit;
    }

    public void setMonthlyLimit(BigDecimal monthlyLimit) {
        this.monthlyLimit = monthlyLimit;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(BigDecimal spentAmount) {
        this.spentAmount = spentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public double getPercentageUsed() {
        return percentageUsed;
    }

    public void setPercentageUsed(double percentageUsed) {
        this.percentageUsed = percentageUsed;
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

    public String getAlertStatus() {
        return alertStatus;
    }

    public void setAlertStatus(String alertStatus) {
        this.alertStatus = alertStatus;
    }

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }
}
