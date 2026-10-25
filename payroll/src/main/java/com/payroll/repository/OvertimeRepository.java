package com.payroll.repository;

import com.payroll.entity.Overtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OvertimeRepository extends JpaRepository<Overtime, Long> {
    Optional<Overtime> findByEmployeeIdAndPayPeriod(Long employeeId, String payPeriod);
    List<Overtime> findByPayPeriod(String payPeriod);
}
