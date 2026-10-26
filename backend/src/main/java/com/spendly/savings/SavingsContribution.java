package com.spendly.savings;

import com.spendly.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "savings_contributions")
public class SavingsContribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "savings_goal_id", nullable = false)
    private SavingsGoal savingsGoal;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate contributionDate;

    @Column(length = 255)
    private String note;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public SavingsContribution() {
    }

    public SavingsContribution(User user, SavingsGoal savingsGoal, BigDecimal amount, LocalDate contributionDate, String note) {
        this.user = user;
        this.savingsGoal = savingsGoal;
        this.amount = amount;
        this.contributionDate = contributionDate;
        this.note = note;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.contributionDate == null) {
            this.contributionDate = LocalDate.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SavingsGoal getSavingsGoal() {
        return savingsGoal;
    }

    public void setSavingsGoal(SavingsGoal savingsGoal) {
        this.savingsGoal = savingsGoal;
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
