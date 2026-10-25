package com.payroll.service;

import com.payroll.dto.EmployeeRequest;
import com.payroll.dto.EmployeeResponse;
import com.payroll.dto.EmployeeSalaryComponentDto;

import java.util.List;

public interface EmployeeService {
    List<EmployeeResponse> getAllEmployees();
    EmployeeResponse getEmployeeById(Long id);
    EmployeeResponse getEmployeeByEmpNo(String empNo);
    EmployeeResponse createEmployee(EmployeeRequest request);
    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);
    void deleteEmployee(Long id);

    List<EmployeeSalaryComponentDto> getSalaryComponents(Long empId);
    EmployeeSalaryComponentDto addSalaryComponent(EmployeeSalaryComponentDto dto);
    void removeSalaryComponent(Long id);
}
