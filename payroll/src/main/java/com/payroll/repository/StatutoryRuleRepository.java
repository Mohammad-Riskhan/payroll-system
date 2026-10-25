package com.payroll.repository;

import com.payroll.entity.StatutoryRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StatutoryRuleRepository extends JpaRepository<StatutoryRule, Long> {

    @Query("SELECT sr FROM StatutoryRule sr WHERE sr.ruleType = :ruleType " +
           "AND sr.effectiveFrom <= :date " +
           "AND (sr.effectiveTo IS NULL OR sr.effectiveTo >= :date) " +
           "ORDER BY sr.effectiveFrom DESC")
    List<StatutoryRule> findActiveRulesByTypeAndDate(
            @Param("ruleType") String ruleType,
            @Param("date") LocalDate date);

    default Optional<StatutoryRule> findLatestActiveRule(String ruleType, LocalDate date) {
        List<StatutoryRule> rules = findActiveRulesByTypeAndDate(ruleType, date);
        return rules.isEmpty() ? Optional.empty() : Optional.of(rules.get(0));
    }

    @Query("SELECT sr FROM StatutoryRule sr WHERE sr.effectiveFrom <= :date " +
           "AND (sr.effectiveTo IS NULL OR sr.effectiveTo >= :date)")
    List<StatutoryRule> findAllActiveRulesOnDate(@Param("date") LocalDate date);
}
