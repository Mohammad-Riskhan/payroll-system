package com.payroll.statutory;

import com.payroll.entity.StatutoryRule;
import com.payroll.repository.StatutoryRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Slf4j
@Component("sriLankanStatutoryStrategy")
@RequiredArgsConstructor
public class DatabaseDrivenSriLankanStatutoryStrategy implements StatutoryCalculationStrategy {

    private final StatutoryRuleRepository statutoryRuleRepository;

    private static final BigDecimal DEFAULT_EPF_EMPLOYEE_RATE = new BigDecimal("8.00");
    private static final BigDecimal DEFAULT_EPF_EMPLOYER_RATE = new BigDecimal("12.00");
    private static final BigDecimal DEFAULT_ETF_EMPLOYER_RATE = new BigDecimal("3.00");
    private static final BigDecimal DEFAULT_APIT_RELIEF = new BigDecimal("150000.00");
    private static final BigDecimal DEFAULT_SLAB_SIZE = new BigDecimal("41666.67");
    private static final BigDecimal DEFAULT_OT_HOURS_DIVISOR = new BigDecimal("240.00");
    private static final BigDecimal DEFAULT_OT_MULTIPLIER = new BigDecimal("1.50");
    private static final BigDecimal PERCENT_DIVISOR = new BigDecimal("100.00");

    @Override
    public String getStrategyName() {
        return "SRI_LANKA_STATUTORY_STRATEGY";
    }

    private BigDecimal getRuleValue(String ruleType, LocalDate date, BigDecimal defaultValue) {
        return statutoryRuleRepository.findLatestActiveRule(ruleType, date)
                .map(StatutoryRule::getRateOrSlabValue)
                .orElse(defaultValue);
    }

    @Override
    public BigDecimal calculateEpfEmployee(BigDecimal epfLiableEarnings, LocalDate effectiveDate) {
        if (epfLiableEarnings == null || epfLiableEarnings.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal rate = getRuleValue("EPF_EMPLOYEE_RATE", effectiveDate, DEFAULT_EPF_EMPLOYEE_RATE);
        return epfLiableEarnings.multiply(rate)
                .divide(PERCENT_DIVISOR, 2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateEpfEmployer(BigDecimal epfLiableEarnings, LocalDate effectiveDate) {
        if (epfLiableEarnings == null || epfLiableEarnings.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal rate = getRuleValue("EPF_EMPLOYER_RATE", effectiveDate, DEFAULT_EPF_EMPLOYER_RATE);
        return epfLiableEarnings.multiply(rate)
                .divide(PERCENT_DIVISOR, 2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateEtfEmployer(BigDecimal epfLiableEarnings, LocalDate effectiveDate) {
        if (epfLiableEarnings == null || epfLiableEarnings.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal rate = getRuleValue("ETF_EMPLOYER_RATE", effectiveDate, DEFAULT_ETF_EMPLOYER_RATE);
        return epfLiableEarnings.multiply(rate)
                .divide(PERCENT_DIVISOR, 2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateApit(BigDecimal taxableEarnings, LocalDate effectiveDate) {
        if (taxableEarnings == null || taxableEarnings.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal relief = getRuleValue("APIT_MONTHLY_RELIEF", effectiveDate, DEFAULT_APIT_RELIEF);
        if (taxableEarnings.compareTo(relief) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal remainingTaxable = taxableEarnings.subtract(relief);
        BigDecimal slabSize = getRuleValue("APIT_SLAB_SIZE", effectiveDate, DEFAULT_SLAB_SIZE);

        BigDecimal[] slabRates = new BigDecimal[]{
                getRuleValue("APIT_RATE_SLAB_1", effectiveDate, new BigDecimal("6.00")),
                getRuleValue("APIT_RATE_SLAB_2", effectiveDate, new BigDecimal("12.00")),
                getRuleValue("APIT_RATE_SLAB_3", effectiveDate, new BigDecimal("18.00")),
                getRuleValue("APIT_RATE_SLAB_4", effectiveDate, new BigDecimal("24.00")),
                getRuleValue("APIT_RATE_SLAB_5", effectiveDate, new BigDecimal("30.00"))
        };
        BigDecimal maxRate = getRuleValue("APIT_RATE_MAX", effectiveDate, new BigDecimal("36.00"));

        BigDecimal totalTax = BigDecimal.ZERO;

        for (BigDecimal rate : slabRates) {
            if (remainingTaxable.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            BigDecimal taxableChunk = remainingTaxable.min(slabSize);
            BigDecimal taxChunk = taxableChunk.multiply(rate).divide(PERCENT_DIVISOR, 4, RoundingMode.HALF_UP);
            totalTax = totalTax.add(taxChunk);
            remainingTaxable = remainingTaxable.subtract(taxableChunk);
        }

        if (remainingTaxable.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal taxChunk = remainingTaxable.multiply(maxRate).divide(PERCENT_DIVISOR, 4, RoundingMode.HALF_UP);
            totalTax = totalTax.add(taxChunk);
        }

        return totalTax.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateOvertime(BigDecimal basicSalary, BigDecimal otHours, LocalDate effectiveDate) {
        if (basicSalary == null || otHours == null ||
                basicSalary.compareTo(BigDecimal.ZERO) <= 0 || otHours.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal divisor = getRuleValue("OT_MONTHLY_STANDARD_HOURS", effectiveDate, DEFAULT_OT_HOURS_DIVISOR);
        BigDecimal multiplier = getRuleValue("OT_RATE_MULTIPLIER", effectiveDate, DEFAULT_OT_MULTIPLIER);

        // Formula: (Basic Salary / 240) * 1.5 * OT Hours
        BigDecimal hourlyRate = basicSalary.divide(divisor, 6, RoundingMode.HALF_UP);
        BigDecimal otHourlyRate = hourlyRate.multiply(multiplier);
        return otHourlyRate.multiply(otHours).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateNoPayDeduction(BigDecimal basicSalary, BigDecimal noPayDays, int standardWorkingDays, LocalDate effectiveDate) {
        if (basicSalary == null || noPayDays == null ||
                basicSalary.compareTo(BigDecimal.ZERO) <= 0 || noPayDays.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        int workingDays = standardWorkingDays > 0 ? standardWorkingDays : 22;
        BigDecimal dailyRate = basicSalary.divide(new BigDecimal(workingDays), 6, RoundingMode.HALF_UP);
        return dailyRate.multiply(noPayDays).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public StatutoryBreakdown calculateAll(
            BigDecimal basicSalary,
            BigDecimal epfLiableEarnings,
            BigDecimal taxableEarnings,
            BigDecimal otHours,
            BigDecimal noPayDays,
            int standardWorkingDays,
            LocalDate effectiveDate) {

        BigDecimal epfEmployee = calculateEpfEmployee(epfLiableEarnings, effectiveDate);
        BigDecimal epfEmployer = calculateEpfEmployer(epfLiableEarnings, effectiveDate);
        BigDecimal etfEmployer = calculateEtfEmployer(epfLiableEarnings, effectiveDate);
        BigDecimal apitTax = calculateApit(taxableEarnings, effectiveDate);
        BigDecimal overtimeAmount = calculateOvertime(basicSalary, otHours, effectiveDate);
        BigDecimal noPayDeduction = calculateNoPayDeduction(basicSalary, noPayDays, standardWorkingDays, effectiveDate);

        return StatutoryBreakdown.builder()
                .epfEmployee(epfEmployee)
                .epfEmployer(epfEmployer)
                .etfEmployer(etfEmployer)
                .apitTax(apitTax)
                .overtimeAmount(overtimeAmount)
                .noPayDeduction(noPayDeduction)
                .build();
    }
}
