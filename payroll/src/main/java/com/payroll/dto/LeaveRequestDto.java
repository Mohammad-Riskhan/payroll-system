package com.payroll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private Long id;
    @NotNull(message = "Employee ID is required")
    private Long empId;
    private String empNo;
    private String employeeName;
    @NotNull(message = "Leave type ID is required")
    private Long leaveTypeId;
    private String leaveTypeName;
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    private String status; // PENDING, APPROVED, REJECTED
}
