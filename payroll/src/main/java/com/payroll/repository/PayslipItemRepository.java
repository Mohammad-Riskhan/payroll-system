package com.payroll.repository;

import com.payroll.entity.PayslipItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayslipItemRepository extends JpaRepository<PayslipItem, Long> {
    List<PayslipItem> findByPayslipId(Long payslipId);
}
