package com.payroll.controller;

import com.payroll.common.ApiResponse;
import com.payroll.dto.EPFCFormReportDto;
import com.payroll.dto.PayslipResponse;
import com.payroll.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportingService reportingService;

    @GetMapping("/epf-cform/{periodCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<EPFCFormReportDto>> getEPFCForm(@PathVariable String periodCode) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.generateEPFCForm(periodCode)));
    }

    @GetMapping("/payslips/period/{periodCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<PayslipResponse>>> getAllPayslips(@PathVariable String periodCode) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getAllPayslipsForPeriod(periodCode)));
    }

    @GetMapping("/payslips/employee/{empId}/period/{periodCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<PayslipResponse>> getEmployeePayslip(
            @PathVariable Long empId,
            @PathVariable String periodCode) {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getPayslipForEmployee(empId, periodCode)));
    }

    @GetMapping(value = "/bank-transfer-csv/{payrollRunId}", produces = "text/csv")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PAYROLL_OFFICER', 'ACCOUNTANT')")
    public ResponseEntity<String> downloadBankTransferCsv(@PathVariable Long payrollRunId) {
        String csv = reportingService.generateBankTransferCsv(payrollRunId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bank-transfer-run-" + payrollRunId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
