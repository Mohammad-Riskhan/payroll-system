package com.payroll.service;

import com.payroll.dto.LoanDto;

import java.util.List;

public interface LoanService {
    LoanDto createLoan(LoanDto dto);
    List<LoanDto> getAllLoans();
    List<LoanDto> getEmployeeLoans(Long empId);
}
