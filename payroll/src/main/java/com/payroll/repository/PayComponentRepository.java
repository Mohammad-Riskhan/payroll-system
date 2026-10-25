package com.payroll.repository;

import com.payroll.entity.PayComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayComponentRepository extends JpaRepository<PayComponent, Long> {
    Optional<PayComponent> findByCode(String code);
    Boolean existsByCode(String code);
}
