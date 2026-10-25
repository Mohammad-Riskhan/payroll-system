package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.LoanDto;
import com.payroll.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<LoanDto>>> getAllLoans() {
        return ResponseEntity.ok(ApiResponse.success(loanService.getAllLoans()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<LoanDto>> createLoan(@Valid @RequestBody LoanDto dto) {
        LoanDto created = loanService.createLoan(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Loan approved and created successfully", created));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<List<LoanDto>>> getEmployeeLoans(@PathVariable Long empId) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getEmployeeLoans(empId)));
    }
}
