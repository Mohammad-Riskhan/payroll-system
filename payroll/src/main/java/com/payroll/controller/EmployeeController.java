package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.EmployeeRequest;
import com.payroll.dto.EmployeeResponse;
import com.payroll.dto.EmployeeSalaryComponentDto;
import com.payroll.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'DEPARTMENT_MANAGER')")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getAllEmployees()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }

    @GetMapping("/{id}/salary-components")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER')")
    public ResponseEntity<ApiResponse<List<EmployeeSalaryComponentDto>>> getSalaryComponents(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getSalaryComponents(id)));
    }

    @PostMapping("/{id}/salary-components")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeSalaryComponentDto>> addSalaryComponent(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeSalaryComponentDto dto) {
        dto.setEmpId(id);
        EmployeeSalaryComponentDto created = employeeService.addSalaryComponent(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Salary component added successfully", created));
    }

    @DeleteMapping("/salary-components/{componentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeSalaryComponent(@PathVariable Long componentId) {
        employeeService.removeSalaryComponent(componentId);
        return ResponseEntity.ok(ApiResponse.success("Salary component removed successfully", null));
    }
}
