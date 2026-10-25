package com.payroll.repository;

import com.payroll.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmpNo(String empNo);
    Boolean existsByEmpNo(String empNo);
    Boolean existsByNic(String nic);
    List<Employee> findByDepartmentId(Long departmentId);
}
