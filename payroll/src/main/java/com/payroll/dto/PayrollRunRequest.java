package com.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunRequest {
    @NotBlank(message = "Period code is required (e.g. 2026-10)")
    private String periodCode;
}
