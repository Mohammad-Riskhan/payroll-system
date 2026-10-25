package com.payroll.entity;

import com.payroll.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salary_structures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructure extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;
}
