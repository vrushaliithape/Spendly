package com.spendly.savings;

import com.spendly.exception.BadRequestException;
import com.spendly.exception.ResourceNotFoundException;
import com.spendly.user.User;
import com.spendly.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class SavingsService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsContributionRepository contributionRepository;
    private final UserRepository userRepository;

    public SavingsService(SavingsGoalRepository savingsGoalRepository,
                          SavingsContributionRepository contributionRepository,
                          UserRepository userRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.contributionRepository = contributionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SavingsGoalResponse createGoal(Long userId, SavingsGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SavingsGoal goal = new SavingsGoal(
                user,
                request.getName().trim(),
                request.getTargetAmount(),
                request.getTargetDate(),
                request.getDescription() != null ? request.getDescription().trim() : ""
        );

        SavingsGoal saved = savingsGoalRepository.save(goal);
        return SavingsGoalResponse.fromEntity(saved);
    }

    public List<SavingsGoalResponse> getGoals(Long userId, String status) {
        List<SavingsGoal> goals;
        if (status != null && !status.isBlank()) {
            goals = savingsGoalRepository.findByUserIdAndStatus(userId, status.trim().toUpperCase());
        } else {
            goals = savingsGoalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return goals.stream().map(SavingsGoalResponse::fromEntity).toList();
    }

    public SavingsGoalResponse getGoalById(Long userId, Long goalId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found or unauthorized"));
        return SavingsGoalResponse.fromEntity(goal);
    }

    @Transactional
    public SavingsGoalResponse updateGoal(Long userId, Long goalId, SavingsGoalRequest request) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found or unauthorized"));

        goal.setName(request.getName().trim());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetDate(request.getTargetDate());
        goal.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        } else {
            goal.setStatus("IN_PROGRESS");
        }

        SavingsGoal updated = savingsGoalRepository.save(goal);
        return SavingsGoalResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found or unauthorized"));
        savingsGoalRepository.delete(goal);
    }

    @Transactional
    public ContributionResponse addContribution(Long userId, Long goalId, ContributionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found or unauthorized"));

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Contribution amount must be greater than zero");
        }

        LocalDate contributionDate = request.getContributionDate() != null ?
                request.getContributionDate() : LocalDate.now();

        SavingsContribution contribution = new SavingsContribution(
                user,
                goal,
                request.getAmount(),
                contributionDate,
                request.getNote() != null ? request.getNote().trim() : ""
        );

        SavingsContribution saved = contributionRepository.save(contribution);

        // Update target goal's currentAmount atomically
        BigDecimal newTotal = goal.getCurrentAmount().add(request.getAmount());
        goal.setCurrentAmount(newTotal);
        if (newTotal.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus("COMPLETED");
        }
        savingsGoalRepository.save(goal);

        return ContributionResponse.fromEntity(saved);
    }

    public List<ContributionResponse> getContributions(Long userId, Long goalId) {
        // Verify ownership
        savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found or unauthorized"));

        List<SavingsContribution> list =
                contributionRepository.findBySavingsGoalIdAndUserIdOrderByContributionDateDesc(goalId, userId);
        return list.stream().map(ContributionResponse::fromEntity).toList();
    }
}
