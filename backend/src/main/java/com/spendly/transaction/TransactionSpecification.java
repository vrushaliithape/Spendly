package com.spendly.transaction;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    public static Specification<Transaction> filter(
            Long userId,
            TransactionType type,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Strictly isolate data by authenticated user ID
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("category"), category.trim()));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), endDate));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate catMatch = cb.like(cb.lower(root.get("category")), searchPattern);
                predicates.add(cb.or(descMatch, catMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
