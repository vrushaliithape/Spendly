package com.spendly.savings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingsContributionRepository extends JpaRepository<SavingsContribution, Long> {

    List<SavingsContribution> findBySavingsGoalIdAndUserIdOrderByContributionDateDesc(Long savingsGoalId, Long userId);
}
