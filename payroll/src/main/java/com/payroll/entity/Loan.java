package com.payroll.entity;

import com.payroll.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "loans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;

    @Column(name = "loan_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "installment_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal installmentAmount;

    @Column(name = "total_installments", nullable = false)
    private Integer totalInstallments;

    @Column(name = "remaining_installments", nullable = false)
    private Integer remainingInstallments;

    @Column(nullable = false, length = 50)
    private String status; // ACTIVE, COMPLETED, CANCELLED
}
