package com.payroll.service;

import com.payroll.dto.AuditLogDto;

import java.util.List;

public interface AuditLogService {
    List<AuditLogDto> getRecentLogs();
    List<AuditLogDto> getLogsByEntity(String entityName);
    void logAction(String username, String action, String entityName, Long entityId);
}
