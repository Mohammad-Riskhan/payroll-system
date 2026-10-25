package com.payroll.repository;

import com.payroll.entity.EmployeeBankDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeBankDetailRepository extends JpaRepository<EmployeeBankDetail, Long> {
    Optional<EmployeeBankDetail> findByEmployeeId(Long employeeId);
}
