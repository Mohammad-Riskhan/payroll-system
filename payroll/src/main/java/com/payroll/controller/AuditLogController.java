package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.AuditLogDto;
import com.payroll.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ACCOUNTANT', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getRecentLogs(
            @RequestParam(required = false) String entityName) {
        if (entityName != null && !entityName.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(auditLogService.getLogsByEntity(entityName.trim())));
        }
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getRecentLogs()));
    }
}
