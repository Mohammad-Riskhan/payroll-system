package com.payroll.service.impl;

import com.payroll.common.BadRequestException;
import com.payroll.common.ResourceNotFoundException;
import com.payroll.dto.*;
import com.payroll.entity.Company;
import com.payroll.entity.PayComponent;
import com.payroll.entity.SalaryStructure;
import com.payroll.repository.*;
import com.payroll.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final CompanyRepository companyRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final PayComponentRepository payComponentRepository;
    private final SalaryStructureRepository salaryStructureRepository;

    @Override
    @Transactional(readOnly = true)
    public CompanyDto getCompanyDetails() {
        Company company = companyRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Company details not found"));

        return CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .registrationNo(company.getRegistrationNo())
                .epfRegistrationNo(company.getEpfRegistrationNo())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BranchDto> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(b -> BranchDto.builder()
                        .id(b.getId())
                        .companyId(b.getCompany() != null ? b.getCompany().getId() : null)
                        .companyName(b.getCompany() != null ? b.getCompany().getName() : "")
                        .name(b.getName())
                        .code(b.getCode())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> DepartmentDto.builder()
                        .id(d.getId())
                        .branchId(d.getBranch() != null ? d.getBranch().getId() : null)
                        .branchName(d.getBranch() != null ? d.getBranch().getName() : "")
                        .name(d.getName())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DesignationDto> getAllDesignations() {
        return designationRepository.findAll().stream()
                .map(d -> DesignationDto.builder()
                        .id(d.getId())
                        .title(d.getTitle())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayComponentDto> getAllPayComponents() {
        return payComponentRepository.findAll().stream()
                .map(p -> PayComponentDto.builder()
                        .id(p.getId())
                        .code(p.getCode())
                        .name(p.getName())
                        .type(p.getType())
                        .isTaxable(p.getIsTaxable())
                        .isEpfLiable(p.getIsEpfLiable())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PayComponentDto createPayComponent(PayComponentDto dto) {
        if (payComponentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Pay component code already exists: " + dto.getCode());
        }

        PayComponent component = PayComponent.builder()
                .code(dto.getCode().trim().toUpperCase())
                .name(dto.getName().trim())
                .type(dto.getType().trim().toUpperCase())
                .isTaxable(dto.getIsTaxable() != null ? dto.getIsTaxable() : true)
                .isEpfLiable(dto.getIsEpfLiable() != null ? dto.getIsEpfLiable() : true)
                .build();

        PayComponent saved = payComponentRepository.save(component);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalaryStructureDto> getAllSalaryStructures() {
        return salaryStructureRepository.findAll().stream()
                .map(s -> SalaryStructureDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .description(s.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SalaryStructureDto createSalaryStructure(SalaryStructureDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new BadRequestException("Salary structure name cannot be empty");
        }

        SalaryStructure entity = SalaryStructure.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription() != null ? dto.getDescription().trim() : "")
                .build();

        SalaryStructure saved = salaryStructureRepository.save(entity);
        dto.setId(saved.getId());
        return dto;
    }
}
