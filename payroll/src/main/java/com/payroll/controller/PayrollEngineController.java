package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.BankTransferBatchResponse;
import com.payroll.dto.PayrollRunLineResponse;
import com.payroll.dto.PayrollRunRequest;
import com.payroll.dto.PayrollRunResponse;
import com.payroll.service.PayrollEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payroll")
@RequiredArgsConstructor
public class PayrollEngineController {

    private final PayrollEngineService payrollEngineService;

    @PostMapping("/calculate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<ApiResponse<PayrollRunResponse>> calculatePayroll(@Valid @RequestBody PayrollRunRequest request) {
        PayrollRunResponse response = payrollEngineService.calculatePayroll(request.getPeriodCode());
        return ResponseEntity.ok(ApiResponse.success("Payroll calculated successfully for period " + request.getPeriodCode(), response));
    }

    @PostMapping({"/{id}/lock", "/lock/{id}"})
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PAYROLL_OFFICER')")
    public ResponseEntity<ApiResponse<PayrollRunResponse>> lockPayroll(@PathVariable Long id) {
        PayrollRunResponse response = payrollEngineService.lockPayroll(id);
        return ResponseEntity.ok(ApiResponse.success("Payroll run locked and immutable", response));
    }

    @GetMapping("/runs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<PayrollRunResponse>>> getAllRuns() {
        return ResponseEntity.ok(ApiResponse.success(payrollEngineService.getAllPayrollRuns()));
    }

    @GetMapping("/runs/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<PayrollRunResponse>> getRunById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(payrollEngineService.getPayrollRun(id)));
    }

    @GetMapping("/runs/period/{periodCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<PayrollRunResponse>> getRunByPeriod(@PathVariable String periodCode) {
        return ResponseEntity.ok(ApiResponse.success(payrollEngineService.getPayrollRunByPeriod(periodCode)));
    }

    @GetMapping("/runs/{id}/lines")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<PayrollRunLineResponse>>> getRunLines(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(payrollEngineService.getPayrollRunLines(id)));
    }

    @PostMapping("/{id}/bank-batch")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<BankTransferBatchResponse>> generateBankBatch(@PathVariable Long id) {
        BankTransferBatchResponse response = payrollEngineService.generateBankTransferBatch(id);
        return ResponseEntity.ok(ApiResponse.success("Bank transfer batch created successfully", response));
    }

    @GetMapping("/{id}/bank-batches")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<BankTransferBatchResponse>>> getBankBatches(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(payrollEngineService.getBankTransferBatches(id)));
    }
}
