package com.payroll.service.impl;

import com.payroll.dto.AuditLogDto;
import com.payroll.entity.AuditLog;
import com.payroll.entity.User;
import com.payroll.repository.AuditLogRepository;
import com.payroll.repository.UserRepository;
import com.payroll.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDto> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDto> getLogsByEntity(String entityName) {
        return auditLogRepository.findByEntityNameOrderByTimestampDesc(entityName).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void logAction(String username, String action, String entityName, Long entityId) {
        User user = null;
        if (username != null) {
            user = userRepository.findByUsername(username).orElse(null);
        }

        AuditLog logEntry = AuditLog.builder()
                .user(user)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(logEntry);
        log.info("Audit log saved: user={}, action={}, entity={}, entityId={}", username, action, entityName, entityId);
    }

    private AuditLogDto mapToDto(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .username(log.getUser() != null ? log.getUser().getUsername() : "SYSTEM")
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .timestamp(log.getTimestamp())
                .build();
    }
}
