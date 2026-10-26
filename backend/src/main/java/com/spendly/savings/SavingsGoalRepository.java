package com.spendly.savings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

    Optional<SavingsGoal> findByIdAndUserId(Long id, Long userId);

    List<SavingsGoal> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SavingsGoal> findByUserIdAndStatus(Long userId, String status);
}
