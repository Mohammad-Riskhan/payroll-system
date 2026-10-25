package com.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
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
public class EmployeeRequest {

    @NotBlank(message = "Employee number is required")
    private String empNo;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "NIC is required")
    private String nic;

    @NotNull(message = "Joined date is required")
    private LocalDate joinedDate;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Designation ID is required")
    private Long designationId;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.00", message = "Basic salary must be non-negative")
    private BigDecimal basicSalary;

    private String bankName;
    private String branchName;
    private String accountNo;
}
