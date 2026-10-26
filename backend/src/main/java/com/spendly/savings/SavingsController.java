package com.spendly.savings;

import com.spendly.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings-goals")
public class SavingsController {

    private final SavingsService savingsService;

    public SavingsController(SavingsService savingsService) {
        this.savingsService = savingsService;
    }

    @PostMapping
    public ResponseEntity<SavingsGoalResponse> createGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SavingsGoalRequest request) {
        SavingsGoalResponse response = savingsService.createGoal(userPrincipal.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SavingsGoalResponse>> getGoals(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String status) {
        List<SavingsGoalResponse> goals = savingsService.getGoals(userPrincipal.getId(), status);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavingsGoalResponse> getGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        SavingsGoalResponse response = savingsService.getGoalById(userPrincipal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalResponse> updateGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoalRequest request) {
        SavingsGoalResponse response = savingsService.updateGoal(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        savingsService.deleteGoal(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/contributions")
    public ResponseEntity<ContributionResponse> addContribution(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody ContributionRequest request) {
        ContributionResponse response = savingsService.addContribution(userPrincipal.getId(), id, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<List<ContributionResponse>> getContributions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        List<ContributionResponse> list = savingsService.getContributions(userPrincipal.getId(), id);
        return ResponseEntity.ok(list);
    }
}
