package com.payroll.service.impl;

import com.payroll.common.ResourceNotFoundException;
import com.payroll.dto.StatutoryRuleDto;
import com.payroll.entity.StatutoryRule;
import com.payroll.repository.StatutoryRuleRepository;
import com.payroll.service.StatutoryRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatutoryRuleServiceImpl implements StatutoryRuleService {

    private final StatutoryRuleRepository statutoryRuleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StatutoryRuleDto> getAllRules() {
        return statutoryRuleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StatutoryRuleDto getRuleById(Long id) {
        return statutoryRuleRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Statutory rule not found with id: " + id));
    }

    @Override
    @Transactional
    public StatutoryRuleDto createRule(StatutoryRuleDto dto) {
        StatutoryRule rule = StatutoryRule.builder()
                .ruleType(dto.getRuleType().trim())
                .rateOrSlabValue(dto.getRateOrSlabValue())
                .effectiveFrom(dto.getEffectiveFrom())
                .effectiveTo(dto.getEffectiveTo())
                .build();
        return mapToDto(statutoryRuleRepository.save(rule));
    }

    @Override
    @Transactional
    public StatutoryRuleDto updateRule(Long id, StatutoryRuleDto dto) {
        StatutoryRule rule = statutoryRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Statutory rule not found with id: " + id));

        rule.setRuleType(dto.getRuleType().trim());
        rule.setRateOrSlabValue(dto.getRateOrSlabValue());
        rule.setEffectiveFrom(dto.getEffectiveFrom());
        rule.setEffectiveTo(dto.getEffectiveTo());

        return mapToDto(statutoryRuleRepository.save(rule));
    }

    @Override
    @Transactional
    public void deleteRule(Long id) {
        if (!statutoryRuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Statutory rule not found with id: " + id);
        }
        statutoryRuleRepository.deleteById(id);
    }

    private StatutoryRuleDto mapToDto(StatutoryRule rule) {
        return StatutoryRuleDto.builder()
                .id(rule.getId())
                .ruleType(rule.getRuleType())
                .rateOrSlabValue(rule.getRateOrSlabValue())
                .effectiveFrom(rule.getEffectiveFrom())
                .effectiveTo(rule.getEffectiveTo())
                .build();
    }
}
