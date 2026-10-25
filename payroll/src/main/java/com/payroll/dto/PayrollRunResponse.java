package com.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunResponse {
    private Long id;
    private Long payrollPeriodId;
    private String periodCode;
    private String status; // DRAFT, CALCULATED, APPROVED, LOCKED
    private BigDecimal totalGross;
    private BigDecimal totalNet;
    private Integer employeeCount;
    private LocalDateTime createdAt;
    private String createdBy;
}
