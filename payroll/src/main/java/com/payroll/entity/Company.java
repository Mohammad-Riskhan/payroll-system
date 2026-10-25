package com.payroll.entity;

import com.payroll.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "registration_no", nullable = false, unique = true, length = 50)
    private String registrationNo;

    @Column(name = "epf_registration_no", nullable = false, length = 50)
    private String epfRegistrationNo;
}
