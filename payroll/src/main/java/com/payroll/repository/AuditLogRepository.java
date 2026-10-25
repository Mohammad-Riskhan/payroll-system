package com.payroll.repository;

import com.payroll.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntityNameOrderByTimestampDesc(String entityName);
    List<AuditLog> findTop50ByOrderByTimestampDesc();
}
