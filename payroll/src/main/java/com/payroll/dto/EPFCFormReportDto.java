package com.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EPFCFormReportDto {

    private String companyName;
    private String epfRegistrationNo;
    private String periodCode;
    private List<EPFRecordDto> records;
    private BigDecimal totalGrossForEpf;
    private BigDecimal totalEmployeeContribution;
    private BigDecimal totalEmployerContribution;
    private BigDecimal grandTotalContribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EPFRecordDto {
        private String empNo;
        private String employeeName;
        private String nic;
        private BigDecimal epfLiableEarnings;
        private BigDecimal employeeEpf8;
        private BigDecimal employerEpf12;
        private BigDecimal totalEpf20;
    }
}
