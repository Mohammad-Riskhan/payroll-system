package com.payroll.service.impl;

import com.payroll.common.ResourceNotFoundException;
import com.payroll.dto.EPFCFormReportDto;
import com.payroll.dto.PayslipItemDto;
import com.payroll.dto.PayslipResponse;
import com.payroll.entity.*;
import com.payroll.repository.*;
import com.payroll.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingServiceImpl implements ReportingService {

    private final CompanyRepository companyRepository;
    private final PayslipRepository payslipRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final PayrollRunLineRepository payrollRunLineRepository;
    private final EmployeeBankDetailRepository bankDetailRepository;

    @Override
    @Transactional(readOnly = true)
    public EPFCFormReportDto generateEPFCForm(String periodCode) {
        Company company = companyRepository.findAll().stream().findFirst()
                .orElse(Company.builder()
                        .name("Lanka Precision Technologies (Pvt) Ltd")
                        .epfRegistrationNo("EPF/COL/98765")
                        .build());

        List<Payslip> payslips = payslipRepository.findByPayPeriod(periodCode);
        if (payslips.isEmpty()) {
            throw new ResourceNotFoundException("No payroll data found for period: " + periodCode);
        }

        List<EPFCFormReportDto.EPFRecordDto> records = new ArrayList<>();
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalEmpEpf = BigDecimal.ZERO;
        BigDecimal totalEmplrEpf = BigDecimal.ZERO;

        for (Payslip payslip : payslips) {
            Employee emp = payslip.getEmployee();
            PayrollRunLine line = payslip.getPayrollRunLine();

            BigDecimal empEpf = line != null ? line.getEmployeeEpf() : BigDecimal.ZERO;
            // In Sri Lanka: EPF Employee = 8%, Employer = 12% (1.5x employee)
            BigDecimal emplrEpf = empEpf.multiply(new BigDecimal("1.5")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalEpf = empEpf.add(emplrEpf);

            // Derive EPF Liable Earnings (EPF 8% / 0.08)
            BigDecimal epfLiable = (empEpf.compareTo(BigDecimal.ZERO) > 0)
                    ? empEpf.divide(new BigDecimal("0.08"), 2, RoundingMode.HALF_UP)
                    : (line != null ? line.getGrossEarnings() : BigDecimal.ZERO);

            records.add(EPFCFormReportDto.EPFRecordDto.builder()
                    .empNo(emp.getEmpNo())
                    .employeeName(emp.getFirstName() + " " + emp.getLastName())
                    .nic(emp.getNic())
                    .epfLiableEarnings(epfLiable)
                    .employeeEpf8(empEpf)
                    .employerEpf12(emplrEpf)
                    .totalEpf20(totalEpf)
                    .build());

            totalGross = totalGross.add(epfLiable);
            totalEmpEpf = totalEmpEpf.add(empEpf);
            totalEmplrEpf = totalEmplrEpf.add(emplrEpf);
        }

        return EPFCFormReportDto.builder()
                .companyName(company.getName())
                .epfRegistrationNo(company.getEpfRegistrationNo())
                .periodCode(periodCode)
                .records(records)
                .totalGrossForEpf(totalGross)
                .totalEmployeeContribution(totalEmpEpf)
                .totalEmployerContribution(totalEmplrEpf)
                .grandTotalContribution(totalEmpEpf.add(totalEmplrEpf))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PayslipResponse getPayslipForEmployee(Long empId, String periodCode) {
        Payslip payslip = payslipRepository.findByEmployeeIdAndPayPeriod(empId, periodCode)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip not found for employee id " + empId + " and period " + periodCode));

        return mapToPayslipResponse(payslip);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayslipResponse> getAllPayslipsForPeriod(String periodCode) {
        return payslipRepository.findByPayPeriod(periodCode).stream()
                .map(this::mapToPayslipResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public String generateBankTransferCsv(Long payrollRunId) {
        PayrollRun run = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found with id: " + payrollRunId));

        List<PayrollRunLine> lines = payrollRunLineRepository.findByPayrollRunId(payrollRunId);

        StringBuilder csv = new StringBuilder();
        csv.append("Beneficiary Name,Account Number,Bank Name,Branch Name,NIC,Net Amount (LKR),Reference\n");

        for (PayrollRunLine line : lines) {
            Employee emp = line.getEmployee();
            EmployeeBankDetail bank = bankDetailRepository.findByEmployeeId(emp.getId()).orElse(null);

            String bankName = bank != null ? bank.getBankName() : "N/A";
            String branchName = bank != null ? bank.getBranchName() : "N/A";
            String accountNo = bank != null ? bank.getAccountNo() : "N/A";
            String period = run.getPayrollPeriod() != null ? run.getPayrollPeriod().getPeriodCode() : "";

            csv.append("\"").append(emp.getFirstName()).append(" ").append(emp.getLastName()).append("\",")
                    .append("\"").append(accountNo).append("\",")
                    .append("\"").append(bankName).append("\",")
                    .append("\"").append(branchName).append("\",")
                    .append("\"").append(emp.getNic()).append("\",")
                    .append(line.getNetPay().toPlainString()).append(",")
                    .append("\"SALARY-").append(period).append("-").append(emp.getEmpNo()).append("\"\n");
        }

        return csv.toString();
    }

    private PayslipResponse mapToPayslipResponse(Payslip payslip) {
        Employee emp = payslip.getEmployee();
        PayrollRunLine line = payslip.getPayrollRunLine();
        EmployeeBankDetail bank = bankDetailRepository.findByEmployeeId(emp.getId()).orElse(null);

        Map<String, List<PayslipItem>> grouped = payslip.getItems().stream()
                .collect(Collectors.groupingBy(PayslipItem::getType));

        List<PayslipItemDto> earnings = grouped.getOrDefault("EARNING", List.of()).stream()
                .map(i -> new PayslipItemDto(i.getComponentName(), i.getType(), i.getAmount()))
                .collect(Collectors.toList());

        List<PayslipItemDto> deductions = new ArrayList<>();
        grouped.getOrDefault("DEDUCTION", List.of()).forEach(i ->
                deductions.add(new PayslipItemDto(i.getComponentName(), i.getType(), i.getAmount())));
        grouped.getOrDefault("STATUTORY", List.of()).forEach(i ->
                deductions.add(new PayslipItemDto(i.getComponentName(), i.getType(), i.getAmount())));

        List<PayslipItemDto> employerContributions = grouped.getOrDefault("EMPLOYER_CONTRIBUTION", List.of()).stream()
                .map(i -> new PayslipItemDto(i.getComponentName(), i.getType(), i.getAmount()))
                .collect(Collectors.toList());

        BigDecimal emplrEpf = employerContributions.stream()
                .filter(i -> i.getComponentName().contains("EPF"))
                .map(PayslipItemDto::getAmount)
                .findFirst().orElse(BigDecimal.ZERO);

        BigDecimal emplrEtf = employerContributions.stream()
                .filter(i -> i.getComponentName().contains("ETF"))
                .map(PayslipItemDto::getAmount)
                .findFirst().orElse(BigDecimal.ZERO);

        BigDecimal totalDeductions = deductions.stream()
                .map(PayslipItemDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PayslipResponse.builder()
                .id(payslip.getId())
                .empId(emp.getId())
                .empNo(emp.getEmpNo())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .department(emp.getDepartment() != null ? emp.getDepartment().getName() : "")
                .designation(emp.getDesignation() != null ? emp.getDesignation().getTitle() : "")
                .nic(emp.getNic())
                .bankName(bank != null ? bank.getBankName() : "")
                .branchName(bank != null ? bank.getBranchName() : "")
                .accountNo(bank != null ? bank.getAccountNo() : "")
                .payPeriod(payslip.getPayPeriod())
                .issuedDate(payslip.getIssuedDate())
                .basicSalary(emp.getBasicSalary())
                .grossEarnings(line != null ? line.getGrossEarnings() : BigDecimal.ZERO)
                .employeeEpf(line != null ? line.getEmployeeEpf() : BigDecimal.ZERO)
                .apitTax(line != null ? line.getApitTax() : BigDecimal.ZERO)
                .totalDeductions(totalDeductions)
                .netPay(line != null ? line.getNetPay() : BigDecimal.ZERO)
                .employerEpf(emplrEpf)
                .employerEtf(emplrEtf)
                .earnings(earnings)
                .deductions(deductions)
                .employerContributions(employerContributions)
                .build();
    }
}
