package com.payroll.service;

import com.payroll.dto.StatutoryRuleDto;

import java.util.List;

public interface StatutoryRuleService {
    List<StatutoryRuleDto> getAllRules();
    StatutoryRuleDto getRuleById(Long id);
    StatutoryRuleDto createRule(StatutoryRuleDto dto);
    StatutoryRuleDto updateRule(Long id, StatutoryRuleDto dto);
    void deleteRule(Long id);
}
