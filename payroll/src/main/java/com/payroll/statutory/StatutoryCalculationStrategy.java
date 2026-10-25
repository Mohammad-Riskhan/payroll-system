package com.payroll.statutory;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Strategy interface decoupling statutory calculations (EPF, ETF, APIT, Overtime, No Pay)
 * allowing versioned and rule-based calculations without altering core payroll engine logic.
 */
public interface StatutoryCalculationStrategy {

    String getStrategyName();

    BigDecimal calculateEpfEmployee(BigDecimal epfLiableEarnings, LocalDate effectiveDate);

    BigDecimal calculateEpfEmployer(BigDecimal epfLiableEarnings, LocalDate effectiveDate);

    BigDecimal calculateEtfEmployer(BigDecimal epfLiableEarnings, LocalDate effectiveDate);

    BigDecimal calculateApit(BigDecimal taxableEarnings, LocalDate effectiveDate);

    BigDecimal calculateOvertime(BigDecimal basicSalary, BigDecimal otHours, LocalDate effectiveDate);

    BigDecimal calculateNoPayDeduction(BigDecimal basicSalary, BigDecimal noPayDays, int standardWorkingDays, LocalDate effectiveDate);

    StatutoryBreakdown calculateAll(
            BigDecimal basicSalary,
            BigDecimal epfLiableEarnings,
            BigDecimal taxableEarnings,
            BigDecimal otHours,
            BigDecimal noPayDays,
            int standardWorkingDays,
            LocalDate effectiveDate
    );
}
