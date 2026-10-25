package com.payroll.dto;

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
public class EmployeeResponse {
    private Long id;
    private String empNo;
    private String firstName;
    private String lastName;
    private String nic;
    private LocalDate joinedDate;
    private Long departmentId;
    private String departmentName;
    private Long designationId;
    private String designationTitle;
    private BigDecimal basicSalary;
    private BankDetailDto bankDetail;
}
