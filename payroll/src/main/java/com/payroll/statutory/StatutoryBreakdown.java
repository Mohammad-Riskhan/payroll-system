package com.payroll.statutory;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class StatutoryBreakdown {
    private BigDecimal epfEmployee;
    private BigDecimal epfEmployer;
    private BigDecimal etfEmployer;
    private BigDecimal apitTax;
    private BigDecimal overtimeAmount;
    private BigDecimal noPayDeduction;
}
