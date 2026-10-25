package com.payroll.entity;

import com.payroll.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payslip_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayslipItem extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payslip_id", nullable = false)
    private Payslip payslip;

    @Column(name = "component_name", nullable = false, length = 100)
    private String componentName;

    @Column(nullable = false, length = 50)
    private String type; // EARNING, DEDUCTION, STATUTORY, EMPLOYER_CONTRIBUTION

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}
