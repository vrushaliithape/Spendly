package com.spendly.savings;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SavingsGoalResponse {

    private Long id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal remainingAmount;
    private double percentageCompleted;
    private LocalDate targetDate;
    private String description;
    private String status;
    private int contributionsCount;
    private LocalDateTime createdAt;

    public SavingsGoalResponse() {
    }

    public static SavingsGoalResponse fromEntity(SavingsGoal g) {
        SavingsGoalResponse res = new SavingsGoalResponse();
        res.setId(g.getId());
        res.setName(g.getName());
        res.setTargetAmount(g.getTargetAmount());
        res.setCurrentAmount(g.getCurrentAmount() != null ? g.getCurrentAmount() : BigDecimal.ZERO);

        BigDecimal remaining = g.getTargetAmount().subtract(res.getCurrentAmount());
        res.setRemainingAmount(remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining);

        if (g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            double percent = res.getCurrentAmount().multiply(BigDecimal.valueOf(100))
                    .divide(g.getTargetAmount(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
            res.setPercentageCompleted(percent);
        } else {
            res.setPercentageCompleted(0.0);
        }

        res.setTargetDate(g.getTargetDate());
        res.setDescription(g.getDescription());
        res.setStatus(g.getStatus());
        if (org.hibernate.Hibernate.isInitialized(g.getContributions()) && g.getContributions() != null) {
            res.setContributionsCount(g.getContributions().size());
        } else {
            res.setContributionsCount(0);
        }
        res.setCreatedAt(g.getCreatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public double getPercentageCompleted() {
        return percentageCompleted;
    }

    public void setPercentageCompleted(double percentageCompleted) {
        this.percentageCompleted = percentageCompleted;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getContributionsCount() {
        return contributionsCount;
    }

    public void setContributionsCount(int contributionsCount) {
        this.contributionsCount = contributionsCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
