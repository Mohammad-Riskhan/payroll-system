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
public class PayslipItemDto {
    private String componentName;
    private String type; // EARNING, DEDUCTION, STATUTORY, EMPLOYER_CONTRIBUTION
    private BigDecimal amount;
}
