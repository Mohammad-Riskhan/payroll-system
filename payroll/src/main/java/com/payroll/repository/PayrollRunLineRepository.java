package com.payroll.repository;

import com.payroll.entity.PayrollRunLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRunLineRepository extends JpaRepository<PayrollRunLine, Long> {
    List<PayrollRunLine> findByPayrollRunId(Long payrollRunId);
    Optional<PayrollRunLine> findByPayrollRunIdAndEmployeeId(Long payrollRunId, Long employeeId);
}
