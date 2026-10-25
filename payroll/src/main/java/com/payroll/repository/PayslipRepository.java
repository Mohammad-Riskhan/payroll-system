package com.payroll.repository;

import com.payroll.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    List<Payslip> findByPayPeriod(String payPeriod);
    List<Payslip> findByEmployeeIdOrderByPayPeriodDesc(Long employeeId);
    Optional<Payslip> findByEmployeeIdAndPayPeriod(Long employeeId, String payPeriod);
    Optional<Payslip> findByPayrollRunLineId(Long payrollRunLineId);
}
