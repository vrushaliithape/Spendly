package com.spendly.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    List<Transaction> findByUserIdOrderByTransactionDateDescCreatedAtDesc(Long userId);

    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(
            Long userId, LocalDate startDate, LocalDate endDate);

    List<Transaction> findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.category = :category AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndTypeAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
