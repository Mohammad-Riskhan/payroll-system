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
public class BankTransferBatchResponse {
    private Long id;
    private Long payrollRunId;
    private String name;
    private BigDecimal totalAmount;
    private String status;
    private String periodCode;
    private Integer transactionCount;
    private LocalDateTime createdAt;
}
