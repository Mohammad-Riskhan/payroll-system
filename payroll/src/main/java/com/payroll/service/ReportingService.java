package com.payroll.service;

import com.payroll.dto.EPFCFormReportDto;
import com.payroll.dto.PayslipResponse;

import java.util.List;

public interface ReportingService {
    EPFCFormReportDto generateEPFCForm(String periodCode);
    PayslipResponse getPayslipForEmployee(Long empId, String periodCode);
    List<PayslipResponse> getAllPayslipsForPeriod(String periodCode);
    String generateBankTransferCsv(Long payrollRunId);
}
