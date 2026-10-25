package com.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipResponse {
    private Long id;
    private Long empId;
    private String empNo;
    private String employeeName;
    private String department;
    private String designation;
    private String nic;
    private String bankName;
    private String branchName;
    private String accountNo;
    private String payPeriod;
    private LocalDate issuedDate;
    private BigDecimal basicSalary;
    private BigDecimal grossEarnings;
    private BigDecimal employeeEpf;
    private BigDecimal apitTax;
    private BigDecimal totalDeductions;
    private BigDecimal netPay;
    private BigDecimal employerEpf;
    private BigDecimal employerEtf;
    private List<PayslipItemDto> earnings;
    private List<PayslipItemDto> deductions;
    private List<PayslipItemDto> employerContributions;
}
