package com.payroll.service.impl;

import com.payroll.common.ResourceNotFoundException;
import com.payroll.dto.LoanDto;
import com.payroll.entity.Employee;
import com.payroll.entity.Loan;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.LoanRepository;
import com.payroll.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public LoanDto createLoan(LoanDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmpId()));

        Loan loan = Loan.builder()
                .employee(employee)
                .loanAmount(dto.getLoanAmount())
                .installmentAmount(dto.getInstallmentAmount())
                .totalInstallments(dto.getTotalInstallments())
                .remainingInstallments(dto.getTotalInstallments())
                .status("ACTIVE")
                .build();

        Loan saved = loanRepository.save(loan);
        dto.setId(saved.getId());
        dto.setEmpNo(employee.getEmpNo());
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setRemainingInstallments(saved.getRemainingInstallments());
        dto.setStatus(saved.getStatus());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanDto> getAllLoans() {
        return loanRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoanDto> getEmployeeLoans(Long empId) {
        return loanRepository.findByEmployeeId(empId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private LoanDto mapToDto(Loan loan) {
        return LoanDto.builder()
                .id(loan.getId())
                .empId(loan.getEmployee().getId())
                .empNo(loan.getEmployee().getEmpNo())
                .employeeName(loan.getEmployee().getFirstName() + " " + loan.getEmployee().getLastName())
                .loanAmount(loan.getLoanAmount())
                .installmentAmount(loan.getInstallmentAmount())
                .totalInstallments(loan.getTotalInstallments())
                .remainingInstallments(loan.getRemainingInstallments())
                .status(loan.getStatus())
                .build();
    }
}
