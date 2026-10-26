package com.spendly.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    List<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    Optional<Budget> findByUserIdAndCategoryIgnoreCaseAndMonthAndYear(
            Long userId, String category, int month, int year);

    boolean existsByUserIdAndCategoryIgnoreCaseAndMonthAndYear(
            Long userId, String category, int month, int year);
}
