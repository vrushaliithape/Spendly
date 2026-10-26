package com.spendly.settings;

import com.spendly.security.UserPrincipal;
import com.spendly.user.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<UserDto> getSettings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto dto = settingsService.getSettings(userPrincipal.getId());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDto updated = settingsService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {
        settingsService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
