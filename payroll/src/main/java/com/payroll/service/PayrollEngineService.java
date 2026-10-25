package com.payroll.service;

import com.payroll.dto.BankTransferBatchResponse;
import com.payroll.dto.PayrollRunLineResponse;
import com.payroll.dto.PayrollRunResponse;

import java.util.List;

public interface PayrollEngineService {
    PayrollRunResponse calculatePayroll(String periodCode);
    PayrollRunResponse lockPayroll(Long payrollRunId);
    PayrollRunResponse getPayrollRun(Long payrollRunId);
    PayrollRunResponse getPayrollRunByPeriod(String periodCode);
    List<PayrollRunResponse> getAllPayrollRuns();
    List<PayrollRunLineResponse> getPayrollRunLines(Long payrollRunId);
    BankTransferBatchResponse generateBankTransferBatch(Long payrollRunId);
    List<BankTransferBatchResponse> getBankTransferBatches(Long payrollRunId);
}
