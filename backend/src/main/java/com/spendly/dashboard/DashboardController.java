package com.spendly.dashboard;

import com.spendly.security.UserPrincipal;
import com.spendly.transaction.TransactionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();

        DashboardSummaryResponse summary = dashboardService.getSummary(userPrincipal.getId(), targetMonth, targetYear);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<List<CategoryBreakdownResponse>> getCategoryBreakdown(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();

        List<CategoryBreakdownResponse> breakdown = dashboardService.getCategoryBreakdown(
                userPrincipal.getId(), targetMonth, targetYear);
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/monthly-cashflow")
    public ResponseEntity<List<MonthlyCashFlowResponse>> getMonthlyCashFlow(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "6") int months) {

        List<MonthlyCashFlowResponse> cashflow = dashboardService.getMonthlyCashFlow(userPrincipal.getId(), months);
        return ResponseEntity.ok(cashflow);
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<List<TransactionResponse>> getRecentTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        List<TransactionResponse> recent = dashboardService.getRecentTransactions(userPrincipal.getId());
        return ResponseEntity.ok(recent);
    }
}
