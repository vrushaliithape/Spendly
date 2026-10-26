package com.spendly.savings;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ContributionResponse {

    private Long id;
    private Long savingsGoalId;
    private BigDecimal amount;
    private LocalDate contributionDate;
    private String note;
    private LocalDateTime createdAt;

    public ContributionResponse() {
    }

    public static ContributionResponse fromEntity(SavingsContribution c) {
        ContributionResponse res = new ContributionResponse();
        res.setId(c.getId());
        res.setSavingsGoalId(c.getSavingsGoal().getId());
        res.setAmount(c.getAmount());
        res.setContributionDate(c.getContributionDate());
        res.setNote(c.getNote());
        res.setCreatedAt(c.getCreatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSavingsGoalId() {
        return savingsGoalId;
    }

    public void setSavingsGoalId(Long savingsGoalId) {
        this.savingsGoalId = savingsGoalId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getContributionDate() {
        return contributionDate;
    }

    public void setContributionDate(LocalDate contributionDate) {
        this.contributionDate = contributionDate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
