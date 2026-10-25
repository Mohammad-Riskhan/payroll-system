package com.payroll.entity;

import com.payroll.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pay_components")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayComponent extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String type; // EARNING, DEDUCTION, STATUTORY_DEDUCTION

    @Column(name = "is_taxable")
    @Builder.Default
    private Boolean isTaxable = true;

    @Column(name = "is_epf_liable")
    @Builder.Default
    private Boolean isEpfLiable = true;
}
