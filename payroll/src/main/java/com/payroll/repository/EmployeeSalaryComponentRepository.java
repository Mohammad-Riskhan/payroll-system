package com.payroll.repository;

import com.payroll.entity.EmployeeSalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeSalaryComponentRepository extends JpaRepository<EmployeeSalaryComponent, Long> {

    List<EmployeeSalaryComponent> findByEmployeeId(Long employeeId);

    @Query("SELECT esc FROM EmployeeSalaryComponent esc WHERE esc.employee.id = :employeeId " +
           "AND esc.effectiveFrom <= :date " +
           "AND (esc.effectiveTo IS NULL OR esc.effectiveTo >= :date)")
    List<EmployeeSalaryComponent> findActiveComponentsForEmployee(
            @Param("employeeId") Long employeeId,
            @Param("date") LocalDate date);
}
