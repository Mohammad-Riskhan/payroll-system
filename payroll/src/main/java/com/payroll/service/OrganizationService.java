package com.payroll.service;

import com.payroll.dto.*;

import java.util.List;

public interface OrganizationService {
    CompanyDto getCompanyDetails();
    List<BranchDto> getAllBranches();
    List<DepartmentDto> getAllDepartments();
    List<DesignationDto> getAllDesignations();
    List<PayComponentDto> getAllPayComponents();
    PayComponentDto createPayComponent(PayComponentDto dto);
    List<SalaryStructureDto> getAllSalaryStructures();
    SalaryStructureDto createSalaryStructure(SalaryStructureDto dto);
}
