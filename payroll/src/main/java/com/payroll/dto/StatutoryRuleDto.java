package com.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatutoryRuleDto {
    private Long id;
    @NotBlank(message = "Rule type is required")
    private String ruleType;
    @NotNull(message = "Rate or slab value is required")
    private BigDecimal rateOrSlabValue;
    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
