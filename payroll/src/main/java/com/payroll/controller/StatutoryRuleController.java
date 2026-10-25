package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.StatutoryRuleDto;
import com.payroll.service.StatutoryRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/statutory-rules")
@RequiredArgsConstructor
public class StatutoryRuleController {

    private final StatutoryRuleService statutoryRuleService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<StatutoryRuleDto>>> getAllRules() {
        return ResponseEntity.ok(ApiResponse.success(statutoryRuleService.getAllRules()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<StatutoryRuleDto>> getRuleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(statutoryRuleService.getRuleById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<ApiResponse<StatutoryRuleDto>> createRule(@Valid @RequestBody StatutoryRuleDto dto) {
        StatutoryRuleDto created = statutoryRuleService.createRule(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Statutory rule created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<ApiResponse<StatutoryRuleDto>> updateRule(@PathVariable Long id, @Valid @RequestBody StatutoryRuleDto dto) {
        StatutoryRuleDto updated = statutoryRuleService.updateRule(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Statutory rule updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {
        statutoryRuleService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Statutory rule deleted successfully", null));
    }
}
