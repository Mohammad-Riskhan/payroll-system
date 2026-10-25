package com.payroll.repository;

import com.payroll.entity.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {
    List<PayrollRun> findByPayrollPeriodId(Long payrollPeriodId);
    Optional<PayrollRun> findFirstByPayrollPeriodPeriodCodeOrderByCreatedAtDesc(String periodCode);
}
