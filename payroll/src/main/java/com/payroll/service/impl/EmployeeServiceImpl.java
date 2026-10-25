package com.payroll.service.impl;

import com.payroll.common.BadRequestException;
import com.payroll.common.ResourceNotFoundException;
import com.payroll.dto.BankDetailDto;
import com.payroll.dto.EmployeeRequest;
import com.payroll.dto.EmployeeResponse;
import com.payroll.dto.EmployeeSalaryComponentDto;
import com.payroll.entity.*;
import com.payroll.repository.*;
import com.payroll.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final EmployeeBankDetailRepository bankDetailRepository;
    private final PayComponentRepository payComponentRepository;
    private final EmployeeSalaryComponentRepository salaryComponentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByEmpNo(String empNo) {
        Employee employee = employeeRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with empNo: " + empNo));
        return mapToResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmpNo(request.getEmpNo())) {
            throw new BadRequestException("Employee number already exists: " + request.getEmpNo());
        }
        if (employeeRepository.existsByNic(request.getNic())) {
            throw new BadRequestException("Employee with NIC already exists: " + request.getNic());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        Designation designation = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with id: " + request.getDesignationId()));

        Employee employee = Employee.builder()
                .empNo(request.getEmpNo().trim())
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .nic(request.getNic().trim())
                .joinedDate(request.getJoinedDate())
                .department(department)
                .designation(designation)
                .basicSalary(request.getBasicSalary())
                .build();

        Employee saved = employeeRepository.save(employee);

        if (request.getBankName() != null && !request.getBankName().isBlank()) {
            EmployeeBankDetail bankDetail = EmployeeBankDetail.builder()
                    .employee(saved)
                    .bankName(request.getBankName())
                    .branchName(request.getBranchName())
                    .accountNo(request.getAccountNo())
                    .build();
            bankDetailRepository.save(bankDetail);
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        Designation designation = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with id: " + request.getDesignationId()));

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setJoinedDate(request.getJoinedDate());
        employee.setDepartment(department);
        employee.setDesignation(designation);
        employee.setBasicSalary(request.getBasicSalary());

        Employee updated = employeeRepository.save(employee);

        if (request.getBankName() != null && !request.getBankName().isBlank()) {
            EmployeeBankDetail bankDetail = bankDetailRepository.findByEmployeeId(id)
                    .orElse(EmployeeBankDetail.builder().employee(updated).build());
            bankDetail.setBankName(request.getBankName());
            bankDetail.setBranchName(request.getBranchName());
            bankDetail.setAccountNo(request.getAccountNo());
            bankDetailRepository.save(bankDetail);
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeSalaryComponentDto> getSalaryComponents(Long empId) {
        return salaryComponentRepository.findByEmployeeId(empId).stream()
                .map(c -> EmployeeSalaryComponentDto.builder()
                        .id(c.getId())
                        .empId(c.getEmployee().getId())
                        .componentId(c.getComponent().getId())
                        .componentCode(c.getComponent().getCode())
                        .componentName(c.getComponent().getName())
                        .componentType(c.getComponent().getType())
                        .amount(c.getAmount())
                        .effectiveFrom(c.getEffectiveFrom())
                        .effectiveTo(c.getEffectiveTo())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmployeeSalaryComponentDto addSalaryComponent(EmployeeSalaryComponentDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + dto.getEmpId()));
        PayComponent payComponent = payComponentRepository.findById(dto.getComponentId())
                .orElseThrow(() -> new ResourceNotFoundException("Component not found: " + dto.getComponentId()));

        EmployeeSalaryComponent component = EmployeeSalaryComponent.builder()
                .employee(employee)
                .component(payComponent)
                .amount(dto.getAmount())
                .effectiveFrom(dto.getEffectiveFrom())
                .effectiveTo(dto.getEffectiveTo())
                .build();

        EmployeeSalaryComponent saved = salaryComponentRepository.save(component);
        dto.setId(saved.getId());
        dto.setComponentCode(payComponent.getCode());
        dto.setComponentName(payComponent.getName());
        dto.setComponentType(payComponent.getType());
        return dto;
    }

    @Override
    @Transactional
    public void removeSalaryComponent(Long id) {
        salaryComponentRepository.deleteById(id);
    }

    private EmployeeResponse mapToResponse(Employee emp) {
        BankDetailDto bankDto = bankDetailRepository.findByEmployeeId(emp.getId())
                .map(b -> BankDetailDto.builder()
                        .bankName(b.getBankName())
                        .branchName(b.getBranchName())
                        .accountNo(b.getAccountNo())
                        .build())
                .orElse(null);

        return EmployeeResponse.builder()
                .id(emp.getId())
                .empNo(emp.getEmpNo())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .nic(emp.getNic())
                .joinedDate(emp.getJoinedDate())
                .departmentId(emp.getDepartment() != null ? emp.getDepartment().getId() : null)
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : "")
                .designationId(emp.getDesignation() != null ? emp.getDesignation().getId() : null)
                .designationTitle(emp.getDesignation() != null ? emp.getDesignation().getTitle() : "")
                .basicSalary(emp.getBasicSalary())
                .bankDetail(bankDto)
                .build();
    }
}
