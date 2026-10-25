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
public class PayComponentDto {
    private Long id;
    @NotBlank(message = "Code is required")
    private String code;
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Type is required")
    private String type; // EARNING, DEDUCTION, STATUTORY_DEDUCTION
    private Boolean isTaxable;
    private Boolean isEpfLiable;
}
