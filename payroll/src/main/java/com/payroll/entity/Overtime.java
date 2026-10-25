package com.payroll.entity;

import com.payroll.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "overtime")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Overtime extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;

    @Column(name = "pay_period", nullable = false, length = 7)
    private String payPeriod;

    @Column(name = "ot_hours", nullable = false, precision = 12, scale = 2)
    private BigDecimal otHours;

    @Column(name = "ot_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal otAmount;
}
