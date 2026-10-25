package com.payroll.repository;

import com.payroll.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByEmployeeId(Long employeeId);
    List<Loan> findByEmployeeIdAndStatus(Long employeeId, String status);
    List<Loan> findByStatus(String status);
}
