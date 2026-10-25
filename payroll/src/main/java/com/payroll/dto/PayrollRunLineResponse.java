package com.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunLineResponse {
    private Long id;
    private Long payrollRunId;
    private Long empId;
    private String empNo;
    private String employeeName;
    private String department;
    private String designation;
    private BigDecimal basicSalary;
    private BigDecimal grossEarnings;
    private BigDecimal employeeEpf;
    private BigDecimal employerEpf;
    private BigDecimal employerEtf;
    private BigDecimal apitTax;
    private BigDecimal otherDeductions;
    private BigDecimal netPay;
}
