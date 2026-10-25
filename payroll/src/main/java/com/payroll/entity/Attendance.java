package com.payroll.entity;

import com.payroll.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;

    @Column(name = "pay_period", nullable = false, length = 7)
    private String payPeriod;

    @Column(name = "worked_days", nullable = false, precision = 12, scale = 2)
    private BigDecimal workedDays;

    @Column(name = "no_pay_days", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal noPayDays = BigDecimal.ZERO;
}
