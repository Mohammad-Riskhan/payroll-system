package com.payroll;

import com.payroll.repository.StatutoryRuleRepository;
import com.payroll.statutory.DatabaseDrivenSriLankanStatutoryStrategy;
import com.payroll.statutory.StatutoryBreakdown;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class PayrollApplicationTests {

    private StatutoryRuleRepository statutoryRuleRepository;
    private DatabaseDrivenSriLankanStatutoryStrategy statutoryStrategy;

    @BeforeEach
    void setUp() {
        statutoryRuleRepository = Mockito.mock(StatutoryRuleRepository.class);
        // Default: return empty so fallback statutory constants are exercised
        when(statutoryRuleRepository.findLatestActiveRule(anyString(), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        statutoryStrategy = new DatabaseDrivenSriLankanStatutoryStrategy(statutoryRuleRepository);
    }

    @Test
    @DisplayName("Verify EPF 8% employee, 12% employer and ETF 3% statutory contributions")
    void testEpfAndEtfCalculation() {
        BigDecimal epfLiableEarnings = new BigDecimal("360000.00");
        LocalDate date = LocalDate.of(2026, 10, 1);

        BigDecimal epfEmployee = statutoryStrategy.calculateEpfEmployee(epfLiableEarnings, date);
        BigDecimal epfEmployer = statutoryStrategy.calculateEpfEmployer(epfLiableEarnings, date);
        BigDecimal etfEmployer = statutoryStrategy.calculateEtfEmployer(epfLiableEarnings, date);

        assertEquals(new BigDecimal("28800.00"), epfEmployee, "Employee EPF 8% of 360,000 should be 28,800.00");
        assertEquals(new BigDecimal("43200.00"), epfEmployer, "Employer EPF 12% of 360,000 should be 43,200.00");
        assertEquals(new BigDecimal("10800.00"), etfEmployer, "Employer ETF 3% of 360,000 should be 10,800.00");
    }

    @Test
    @DisplayName("Verify IRD APIT Progressive Tax Slabs with LKR 150,000 Monthly Relief")
    void testApitProgressiveTax() {
        LocalDate date = LocalDate.of(2026, 10, 1);

        // Under personal relief -> 0 tax
        BigDecimal taxUnderRelief = statutoryStrategy.calculateApit(new BigDecimal("140000.00"), date);
        assertEquals(new BigDecimal("0.00"), taxUnderRelief);

        // Exactly at relief -> 0 tax
        BigDecimal taxAtRelief = statutoryStrategy.calculateApit(new BigDecimal("150000.00"), date);
        assertEquals(new BigDecimal("0.00"), taxAtRelief);

        // High earner: 385,000.00 Gross
        // Relief: 150,000.00 -> Taxable chunk = 235,000.00
        // Slab 1: 41,666.67 * 6% = 2,500.00
        // Slab 2: 41,666.67 * 12% = 5,000.00
        // Slab 3: 41,666.67 * 18% = 7,500.00
        // Slab 4: 41,666.67 * 24% = 10,000.00
        // Slab 5: 41,666.67 * 30% = 12,500.00
        // Remaining: 26,666.65 * 36% = 9,600.00
        // Total APIT: 47,100.00
        BigDecimal taxHighEarner = statutoryStrategy.calculateApit(new BigDecimal("385000.00"), date);
        assertEquals(new BigDecimal("47100.00"), taxHighEarner, "APIT tax for 385k gross should be 47,100.00");
    }

    @Test
    @DisplayName("Verify Sri Lankan Overtime Formula (Basic / 240) * 1.5 * OT Hours")
    void testOvertimeCalculation() {
        BigDecimal basic = new BigDecimal("240000.00");
        BigDecimal otHours = new BigDecimal("10.00");
        LocalDate date = LocalDate.of(2026, 10, 1);

        BigDecimal otAmount = statutoryStrategy.calculateOvertime(basic, otHours, date);
        assertEquals(new BigDecimal("15000.00"), otAmount, "OT amount for 240k basic and 10 hours should be 15,000.00");
    }

    @Test
    @DisplayName("Verify Sri Lankan No-Pay Deduction Formula (Basic / 22) * No-Pay Days")
    void testNoPayDeduction() {
        BigDecimal basic = new BigDecimal("220000.00");
        BigDecimal noPayDays = new BigDecimal("2.00");
        LocalDate date = LocalDate.of(2026, 10, 1);

        BigDecimal noPayDeduction = statutoryStrategy.calculateNoPayDeduction(basic, noPayDays, 22, date);
        assertEquals(new BigDecimal("20000.00"), noPayDeduction, "No-pay deduction for 2 days on 220k basic should be 20,000.00");
    }

    @Test
    @DisplayName("Verify Comprehensive Statutory Breakdown for Employee")
    void testFullStatutoryBreakdown() {
        BigDecimal basic = new BigDecimal("350000.00");
        BigDecimal epfLiable = new BigDecimal("360000.00");
        BigDecimal taxable = new BigDecimal("385000.00");
        BigDecimal otHours = new BigDecimal("5.00");
        BigDecimal noPayDays = new BigDecimal("1.00");
        LocalDate date = LocalDate.of(2026, 10, 1);

        StatutoryBreakdown breakdown = statutoryStrategy.calculateAll(
                basic, epfLiable, taxable, otHours, noPayDays, 22, date
        );

        assertNotNull(breakdown);
        assertEquals(new BigDecimal("28800.00"), breakdown.getEpfEmployee());
        assertEquals(new BigDecimal("43200.00"), breakdown.getEpfEmployer());
        assertEquals(new BigDecimal("10800.00"), breakdown.getEtfEmployer());
        assertEquals(new BigDecimal("47100.00"), breakdown.getApitTax());
        assertTrue(breakdown.getOvertimeAmount().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(breakdown.getNoPayDeduction().compareTo(BigDecimal.ZERO) > 0);
    }
}
