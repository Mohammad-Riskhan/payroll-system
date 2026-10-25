package com.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class AttendanceDto {
    private Long id;
    @NotNull(message = "Employee ID is required")
    private Long empId;
    private String empNo;
    private String employeeName;
    @NotBlank(message = "Pay period is required")
    private String payPeriod;
    @NotNull(message = "Worked days is required")
    @DecimalMin(value = "0.00", message = "Worked days must be non-negative")
    private BigDecimal workedDays;
    private BigDecimal noPayDays;
}
