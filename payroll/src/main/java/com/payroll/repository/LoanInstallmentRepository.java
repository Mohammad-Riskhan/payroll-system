package com.payroll.repository;

import com.payroll.entity.LoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanInstallmentRepository extends JpaRepository<LoanInstallment, Long> {
    List<LoanInstallment> findByLoanId(Long loanId);
    Optional<LoanInstallment> findByLoanIdAndPayPeriod(Long loanId, String payPeriod);
}
