package com.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
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
public class EmployeeSalaryComponentDto {
    private Long id;
    @NotNull(message = "Employee ID is required")
    private Long empId;
    @NotNull(message = "Component ID is required")
    private Long componentId;
    private String componentCode;
    private String componentName;
    private String componentType;
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.00", message = "Amount must be non-negative")
    private BigDecimal amount;
    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
