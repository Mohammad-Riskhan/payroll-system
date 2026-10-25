package com.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanDto {
    private Long id;
    @NotNull(message = "Employee ID is required")
    private Long empId;
    private String empNo;
    private String employeeName;
    @NotNull(message = "Loan amount is required")
    @DecimalMin(value = "0.01", message = "Loan amount must be positive")
    private BigDecimal loanAmount;
    @NotNull(message = "Installment amount is required")
    @DecimalMin(value = "0.01", message = "Installment amount must be positive")
    private BigDecimal installmentAmount;
    @NotNull(message = "Total installments is required")
    private Integer totalInstallments;
    private Integer remainingInstallments;
    private String status;
}
