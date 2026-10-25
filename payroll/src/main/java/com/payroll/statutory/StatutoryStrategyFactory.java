package com.payroll.statutory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class StatutoryStrategyFactory {

    private final Map<String, StatutoryCalculationStrategy> strategies;
    private final DatabaseDrivenSriLankanStatutoryStrategy defaultStrategy;

    public StatutoryCalculationStrategy getStrategy(String strategyName) {
        if (strategyName == null) {
            return defaultStrategy;
        }
        return strategies.getOrDefault(strategyName, defaultStrategy);
    }

    public StatutoryCalculationStrategy getDefaultStrategy() {
        return defaultStrategy;
    }
}
