package com.spendly.budget;

import com.spendly.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = budgetService.createBudget(userPrincipal.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();

        List<BudgetResponse> budgets = budgetService.getBudgets(userPrincipal.getId(), targetMonth, targetYear);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        BudgetResponse response = budgetService.getBudgetById(userPrincipal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = budgetService.updateBudget(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        budgetService.deleteBudget(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
