package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.*;
import com.payroll.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organization")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/company")
    public ResponseEntity<ApiResponse<CompanyDto>> getCompany() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getCompanyDetails()));
    }

    @GetMapping("/branches")
    public ResponseEntity<ApiResponse<List<BranchDto>>> getBranches() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getAllBranches()));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getAllDepartments()));
    }

    @GetMapping("/designations")
    public ResponseEntity<ApiResponse<List<DesignationDto>>> getDesignations() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getAllDesignations()));
    }

    @GetMapping("/pay-components")
    public ResponseEntity<ApiResponse<List<PayComponentDto>>> getPayComponents() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getAllPayComponents()));
    }

    @PostMapping("/pay-components")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<PayComponentDto>> createPayComponent(@Valid @RequestBody PayComponentDto dto) {
        PayComponentDto created = organizationService.createPayComponent(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pay component created successfully", created));
    }

    @GetMapping("/salary-structures")
    public ResponseEntity<ApiResponse<List<SalaryStructureDto>>> getSalaryStructures() {
        return ResponseEntity.ok(ApiResponse.success(organizationService.getAllSalaryStructures()));
    }

    @PostMapping("/salary-structures")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    public ResponseEntity<ApiResponse<SalaryStructureDto>> createSalaryStructure(@Valid @RequestBody SalaryStructureDto dto) {
        SalaryStructureDto created = organizationService.createSalaryStructure(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Salary structure created successfully", created));
    }
}
