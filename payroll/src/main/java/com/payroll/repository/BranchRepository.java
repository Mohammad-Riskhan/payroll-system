package com.payroll.repository;

import com.payroll.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByCompanyId(Long companyId);
    Optional<Branch> findByCode(String code);
}
