package com.spendly.transaction;

import com.spendly.exception.ResourceNotFoundException;
import com.spendly.user.User;
import com.spendly.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Transaction transaction = new Transaction(
                user,
                request.getType(),
                request.getAmount(),
                request.getCategory().trim(),
                request.getDescription() != null ? request.getDescription().trim() : "",
                request.getTransactionDate(),
                request.getPaymentMethod() != null ? request.getPaymentMethod().trim() : "Cash"
        );

        Transaction saved = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(saved);
    }

    public TransactionResponse getTransactionById(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found or unauthorized"));
        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long userId, Long transactionId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found or unauthorized"));

        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory().trim());
        transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        transaction.setTransactionDate(request.getTransactionDate());
        if (request.getPaymentMethod() != null) {
            transaction.setPaymentMethod(request.getPaymentMethod().trim());
        }

        Transaction updated = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found or unauthorized"));
        transactionRepository.delete(transaction);
    }

    public Page<TransactionResponse> getTransactions(
            Long userId,
            TransactionType type,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            Pageable pageable) {

        Specification<Transaction> spec = TransactionSpecification.filter(
                userId, type, category, startDate, endDate, search);

        return transactionRepository.findAll(spec, pageable).map(TransactionResponse::fromEntity);
    }

    public ByteArrayInputStream exportTransactionsCsv(
            Long userId,
            TransactionType type,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String search) {

        Specification<Transaction> spec = TransactionSpecification.filter(
                userId, type, category, startDate, endDate, search);

        List<Transaction> transactions = transactionRepository.findAll(spec);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("ID,Date,Type,Category,Amount,Payment Method,Description");
            for (Transaction t : transactions) {
                String desc = t.getDescription() != null ? t.getDescription().replace("\"", "\"\"") : "";
                writer.printf("%d,%s,%s,%s,%.2f,%s,\"%s\"%n",
                        t.getId(),
                        t.getTransactionDate(),
                        t.getType(),
                        t.getCategory(),
                        t.getAmount(),
                        t.getPaymentMethod() != null ? t.getPaymentMethod() : "",
                        desc
                );
            }
        }
        return new ByteArrayInputStream(out.toByteArray());
    }
}
