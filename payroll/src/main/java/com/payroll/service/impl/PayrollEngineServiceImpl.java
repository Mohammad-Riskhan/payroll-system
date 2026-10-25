package com.payroll.service.impl;

import com.payroll.common.BadRequestException;
import com.payroll.common.ResourceNotFoundException;
import com.payroll.dto.BankTransferBatchResponse;
import com.payroll.dto.PayrollRunLineResponse;
import com.payroll.dto.PayrollRunResponse;
import com.payroll.entity.*;
import com.payroll.repository.*;
import com.payroll.service.PayrollEngineService;
import com.payroll.statutory.StatutoryCalculationStrategy;
import com.payroll.statutory.StatutoryStrategyFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollEngineServiceImpl implements PayrollEngineService {

    private final PayrollPeriodRepository periodRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final PayrollRunLineRepository payrollRunLineRepository;
    private final PayslipRepository payslipRepository;
    private final PayslipItemRepository payslipItemRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryComponentRepository salaryComponentRepository;
    private final AttendanceRepository attendanceRepository;
    private final OvertimeRepository overtimeRepository;
    private final LoanRepository loanRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final BankTransferBatchRepository bankTransferBatchRepository;
    private final StatutoryStrategyFactory statutoryStrategyFactory;

    @Override
    @Transactional
    public PayrollRunResponse calculatePayroll(String periodCode) {
        log.info("Initiating payroll calculation for period: {}", periodCode);

        // 1. Resolve or create Payroll Period
        PayrollPeriod period = periodRepository.findByPeriodCode(periodCode)
                .orElseGet(() -> {
                    YearMonth ym = YearMonth.parse(periodCode, DateTimeFormatter.ofPattern("yyyy-MM"));
                    return periodRepository.save(PayrollPeriod.builder()
                            .periodCode(periodCode)
                            .startDate(ym.atDay(1))
                            .endDate(ym.atEndOfMonth())
                            .status("OPEN")
                            .build());
                });

        // 2. Check immutability constraint: Locked runs must never be recalculated
        payrollRunRepository.findFirstByPayrollPeriodPeriodCodeOrderByCreatedAtDesc(periodCode)
                .ifPresent(existingRun -> {
                    if ("LOCKED".equalsIgnoreCase(existingRun.getStatus())) {
                        throw new BadRequestException("Payroll run for period " + periodCode +
                                " is LOCKED and strictly immutable. It cannot be recalculated or altered.");
                    }
                });

        LocalDate effectiveDate = period.getEndDate();
        StatutoryCalculationStrategy strategy = statutoryStrategyFactory.getDefaultStrategy();

        // 3. Create or reuse draft payroll run
        PayrollRun payrollRun = payrollRunRepository.findFirstByPayrollPeriodPeriodCodeOrderByCreatedAtDesc(periodCode)
                .orElse(PayrollRun.builder()
                        .payrollPeriod(period)
                        .status("DRAFT")
                        .totalGross(BigDecimal.ZERO)
                        .totalNet(BigDecimal.ZERO)
                        .build());

        // If reusing an existing non-locked run, clear previous lines & payslips
        if (payrollRun.getId() != null) {
            List<PayrollRunLine> oldLines = payrollRunLineRepository.findByPayrollRunId(payrollRun.getId());
            for (PayrollRunLine line : oldLines) {
                payslipRepository.findByPayrollRunLineId(line.getId()).ifPresent(payslipRepository::delete);
                payrollRunLineRepository.delete(line);
            }
        }
        payrollRun = payrollRunRepository.save(payrollRun);

        List<Employee> employees = employeeRepository.findAll();
        BigDecimal runTotalGross = BigDecimal.ZERO;
        BigDecimal runTotalNet = BigDecimal.ZERO;

        for (Employee emp : employees) {
            BigDecimal basicSalary = emp.getBasicSalary();
            if (basicSalary == null) basicSalary = BigDecimal.ZERO;

            // Attendance & No Pay
            Attendance attendance = attendanceRepository.findByEmployeeIdAndPayPeriod(emp.getId(), periodCode)
                    .orElse(null);
            BigDecimal noPayDays = (attendance != null && attendance.getNoPayDays() != null)
                    ? attendance.getNoPayDays()
                    : BigDecimal.ZERO;

            BigDecimal noPayDeduction = strategy.calculateNoPayDeduction(basicSalary, noPayDays, 22, effectiveDate);

            // Overtime
            Overtime overtime = overtimeRepository.findByEmployeeIdAndPayPeriod(emp.getId(), periodCode)
                    .orElse(null);
            BigDecimal otHours = (overtime != null && overtime.getOtHours() != null)
                    ? overtime.getOtHours()
                    : BigDecimal.ZERO;

            BigDecimal otAmount = strategy.calculateOvertime(basicSalary, otHours, effectiveDate);
            if (overtime != null) {
                overtime.setOtAmount(otAmount);
                overtimeRepository.save(overtime);
            }

            // Salary Components (Allowances & Fixed Deductions)
            List<EmployeeSalaryComponent> salaryComponents = salaryComponentRepository
                    .findActiveComponentsForEmployee(emp.getId(), effectiveDate);

            BigDecimal allowancesEpfLiable = BigDecimal.ZERO;
            BigDecimal allowancesNonEpfTaxable = BigDecimal.ZERO;
            BigDecimal otherFixedDeductions = BigDecimal.ZERO;

            List<PayslipItem> payslipItems = new ArrayList<>();

            // Add Basic Salary Item
            payslipItems.add(PayslipItem.builder()
                    .componentName("Basic Salary")
                    .type("EARNING")
                    .amount(basicSalary)
                    .build());

            for (EmployeeSalaryComponent sc : salaryComponents) {
                PayComponent comp = sc.getComponent();
                BigDecimal amount = sc.getAmount();

                if ("EARNING".equalsIgnoreCase(comp.getType())) {
                    if (Boolean.TRUE.equals(comp.getIsEpfLiable())) {
                        allowancesEpfLiable = allowancesEpfLiable.add(amount);
                    } else if (Boolean.TRUE.equals(comp.getIsTaxable())) {
                        allowancesNonEpfTaxable = allowancesNonEpfTaxable.add(amount);
                    }
                    payslipItems.add(PayslipItem.builder()
                            .componentName(comp.getName())
                            .type("EARNING")
                            .amount(amount)
                            .build());
                } else if ("DEDUCTION".equalsIgnoreCase(comp.getType())) {
                    otherFixedDeductions = otherFixedDeductions.add(amount);
                    payslipItems.add(PayslipItem.builder()
                            .componentName(comp.getName())
                            .type("DEDUCTION")
                            .amount(amount)
                            .build());
                }
            }

            if (otAmount.compareTo(BigDecimal.ZERO) > 0) {
                payslipItems.add(PayslipItem.builder()
                        .componentName("Overtime (" + otHours + " hrs)")
                        .type("EARNING")
                        .amount(otAmount)
                        .build());
            }

            if (noPayDeduction.compareTo(BigDecimal.ZERO) > 0) {
                payslipItems.add(PayslipItem.builder()
                        .componentName("No Pay Deduction (" + noPayDays + " days)")
                        .type("DEDUCTION")
                        .amount(noPayDeduction)
                        .build());
            }

            // EPF Liable Earnings = Basic + EPF Liable Allowances (e.g. BRA) - No Pay Deduction
            BigDecimal epfLiableEarnings = basicSalary.add(allowancesEpfLiable).subtract(noPayDeduction);
            if (epfLiableEarnings.compareTo(BigDecimal.ZERO) < 0) {
                epfLiableEarnings = BigDecimal.ZERO;
            }

            // Taxable Earnings = Basic + Allowances + OT - No Pay Deduction
            BigDecimal taxableEarnings = basicSalary
                    .add(allowancesEpfLiable)
                    .add(allowancesNonEpfTaxable)
                    .add(otAmount)
                    .subtract(noPayDeduction);
            if (taxableEarnings.compareTo(BigDecimal.ZERO) < 0) {
                taxableEarnings = BigDecimal.ZERO;
            }

            // Total Gross Earnings
            BigDecimal grossEarnings = basicSalary
                    .add(allowancesEpfLiable)
                    .add(allowancesNonEpfTaxable)
                    .add(otAmount);

            // Statutory Calculations
            BigDecimal employeeEpf = strategy.calculateEpfEmployee(epfLiableEarnings, effectiveDate);
            BigDecimal employerEpf = strategy.calculateEpfEmployer(epfLiableEarnings, effectiveDate);
            BigDecimal employerEtf = strategy.calculateEtfEmployer(epfLiableEarnings, effectiveDate);
            BigDecimal apitTax = strategy.calculateApit(taxableEarnings, effectiveDate);

            payslipItems.add(PayslipItem.builder()
                    .componentName("EPF Employee (8%)")
                    .type("STATUTORY")
                    .amount(employeeEpf)
                    .build());

            if (apitTax.compareTo(BigDecimal.ZERO) > 0) {
                payslipItems.add(PayslipItem.builder()
                        .componentName("APIT (Income Tax)")
                        .type("STATUTORY")
                        .amount(apitTax)
                        .build());
            }

            payslipItems.add(PayslipItem.builder()
                    .componentName("EPF Employer (12%)")
                    .type("EMPLOYER_CONTRIBUTION")
                    .amount(employerEpf)
                    .build());

            payslipItems.add(PayslipItem.builder()
                    .componentName("ETF Employer (3%)")
                    .type("EMPLOYER_CONTRIBUTION")
                    .amount(employerEtf)
                    .build());

            // Active Loans Installments
            BigDecimal loanDeductions = BigDecimal.ZERO;
            List<Loan> activeLoans = loanRepository.findByEmployeeIdAndStatus(emp.getId(), "ACTIVE");
            for (Loan loan : activeLoans) {
                BigDecimal installment = loan.getInstallmentAmount();
                loanDeductions = loanDeductions.add(installment);

                // Record installment
                loanInstallmentRepository.findByLoanIdAndPayPeriod(loan.getId(), periodCode)
                        .orElseGet(() -> loanInstallmentRepository.save(LoanInstallment.builder()
                                .loan(loan)
                                .payPeriod(periodCode)
                                .amount(installment)
                                .status("DEDUCTED")
                                .build()));

                payslipItems.add(PayslipItem.builder()
                        .componentName("Loan Deduction")
                        .type("DEDUCTION")
                        .amount(installment)
                        .build());
            }

            // Total Deductions = No Pay + EPF Employee + APIT Tax + Fixed Deductions + Loans
            BigDecimal totalDeductions = noPayDeduction
                    .add(employeeEpf)
                    .add(apitTax)
                    .add(otherFixedDeductions)
                    .add(loanDeductions);

            BigDecimal netPay = grossEarnings.subtract(totalDeductions).setScale(2, RoundingMode.HALF_UP);
            if (netPay.compareTo(BigDecimal.ZERO) < 0) {
                netPay = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            }

            // Save Payroll Run Line
            PayrollRunLine line = PayrollRunLine.builder()
                    .payrollRun(payrollRun)
                    .employee(emp)
                    .grossEarnings(grossEarnings.setScale(2, RoundingMode.HALF_UP))
                    .employeeEpf(employeeEpf.setScale(2, RoundingMode.HALF_UP))
                    .apitTax(apitTax.setScale(2, RoundingMode.HALF_UP))
                    .netPay(netPay)
                    .build();
            PayrollRunLine savedLine = payrollRunLineRepository.save(line);

            // Generate Payslip
            Payslip payslip = Payslip.builder()
                    .payrollRunLine(savedLine)
                    .employee(emp)
                    .payPeriod(periodCode)
                    .issuedDate(effectiveDate)
                    .build();
            Payslip savedPayslip = payslipRepository.save(payslip);

            for (PayslipItem item : payslipItems) {
                item.setPayslip(savedPayslip);
                payslipItemRepository.save(item);
            }

            runTotalGross = runTotalGross.add(grossEarnings);
            runTotalNet = runTotalNet.add(netPay);
        }

        payrollRun.setStatus("CALCULATED");
        payrollRun.setTotalGross(runTotalGross.setScale(2, RoundingMode.HALF_UP));
        payrollRun.setTotalNet(runTotalNet.setScale(2, RoundingMode.HALF_UP));
        PayrollRun finalRun = payrollRunRepository.save(payrollRun);

        return mapToRunResponse(finalRun, employees.size());
    }

    @Override
    @Transactional
    public PayrollRunResponse lockPayroll(Long payrollRunId) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found with id: " + payrollRunId));

        if ("LOCKED".equalsIgnoreCase(payrollRun.getStatus())) {
            throw new BadRequestException("Payroll run is already locked and immutable.");
        }

        payrollRun.setStatus("LOCKED");
        PayrollRun updated = payrollRunRepository.save(payrollRun);

        // Also lock period
        PayrollPeriod period = updated.getPayrollPeriod();
        if (period != null) {
            period.setStatus("LOCKED");
            periodRepository.save(period);
        }

        int count = payrollRunLineRepository.findByPayrollRunId(updated.getId()).size();
        return mapToRunResponse(updated, count);
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollRunResponse getPayrollRun(Long payrollRunId) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found with id: " + payrollRunId));
        int count = payrollRunLineRepository.findByPayrollRunId(payrollRun.getId()).size();
        return mapToRunResponse(payrollRun, count);
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollRunResponse getPayrollRunByPeriod(String periodCode) {
        PayrollRun payrollRun = payrollRunRepository.findFirstByPayrollPeriodPeriodCodeOrderByCreatedAtDesc(periodCode)
                .orElseThrow(() -> new ResourceNotFoundException("No payroll run found for period: " + periodCode));
        int count = payrollRunLineRepository.findByPayrollRunId(payrollRun.getId()).size();
        return mapToRunResponse(payrollRun, count);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollRunResponse> getAllPayrollRuns() {
        return payrollRunRepository.findAll().stream()
                .map(r -> {
                    int count = payrollRunLineRepository.findByPayrollRunId(r.getId()).size();
                    return mapToRunResponse(r, count);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollRunLineResponse> getPayrollRunLines(Long payrollRunId) {
        return payrollRunLineRepository.findByPayrollRunId(payrollRunId).stream()
                .map(l -> {
                    Employee e = l.getEmployee();
                    return PayrollRunLineResponse.builder()
                            .id(l.getId())
                            .payrollRunId(l.getPayrollRun().getId())
                            .empId(e.getId())
                            .empNo(e.getEmpNo())
                            .employeeName(e.getFirstName() + " " + e.getLastName())
                            .department(e.getDepartment() != null ? e.getDepartment().getName() : "")
                            .designation(e.getDesignation() != null ? e.getDesignation().getTitle() : "")
                            .basicSalary(e.getBasicSalary())
                            .grossEarnings(l.getGrossEarnings())
                            .employeeEpf(l.getEmployeeEpf())
                            .apitTax(l.getApitTax())
                            .netPay(l.getNetPay())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BankTransferBatchResponse generateBankTransferBatch(Long payrollRunId) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found with id: " + payrollRunId));

        List<PayrollRunLine> lines = payrollRunLineRepository.findByPayrollRunId(payrollRunId);
        BigDecimal totalNet = lines.stream()
                .map(PayrollRunLine::getNetPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String periodCode = payrollRun.getPayrollPeriod() != null ? payrollRun.getPayrollPeriod().getPeriodCode() : "BATCH";
        String batchName = "SALARY-TRANSFER-" + periodCode;

        BankTransferBatch batch = BankTransferBatch.builder()
                .payrollRun(payrollRun)
                .name(batchName)
                .totalAmount(totalNet)
                .status("GENERATED")
                .build();

        BankTransferBatch saved = bankTransferBatchRepository.save(batch);

        return BankTransferBatchResponse.builder()
                .id(saved.getId())
                .payrollRunId(payrollRun.getId())
                .name(saved.getName())
                .totalAmount(saved.getTotalAmount())
                .status(saved.getStatus())
                .periodCode(periodCode)
                .transactionCount(lines.size())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankTransferBatchResponse> getBankTransferBatches(Long payrollRunId) {
        return bankTransferBatchRepository.findByPayrollRunId(payrollRunId).stream()
                .map(b -> BankTransferBatchResponse.builder()
                        .id(b.getId())
                        .payrollRunId(b.getPayrollRun().getId())
                        .name(b.getName())
                        .totalAmount(b.getTotalAmount())
                        .status(b.getStatus())
                        .periodCode(b.getPayrollRun().getPayrollPeriod().getPeriodCode())
                        .createdAt(b.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private PayrollRunResponse mapToRunResponse(PayrollRun run, int empCount) {
        return PayrollRunResponse.builder()
                .id(run.getId())
                .payrollPeriodId(run.getPayrollPeriod() != null ? run.getPayrollPeriod().getId() : null)
                .periodCode(run.getPayrollPeriod() != null ? run.getPayrollPeriod().getPeriodCode() : "")
                .status(run.getStatus())
                .totalGross(run.getTotalGross())
                .totalNet(run.getTotalNet())
                .employeeCount(empCount)
                .createdAt(run.getCreatedAt())
                .createdBy(run.getCreatedBy())
                .build();
    }
}
