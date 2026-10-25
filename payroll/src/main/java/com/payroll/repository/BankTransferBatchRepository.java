package com.payroll.repository;

import com.payroll.entity.BankTransferBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankTransferBatchRepository extends JpaRepository<BankTransferBatch, Long> {
    List<BankTransferBatch> findByPayrollRunId(Long payrollRunId);
}
