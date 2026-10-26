package com.spendly.insight;

import com.spendly.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @GetMapping
    public ResponseEntity<List<InsightResponse>> getInsights(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();

        List<InsightResponse> insights = insightService.generateInsights(userPrincipal.getId(), targetMonth, targetYear);
        return ResponseEntity.ok(insights);
    }
}
