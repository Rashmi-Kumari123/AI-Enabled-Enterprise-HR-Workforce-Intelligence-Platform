package nexusHR.insights.service;

import static org.assertj.core.api.Assertions.assertThat;

import nexusHR.insights.dto.AttritionPredictRequest;
import nexusHR.insights.dto.AttritionRiskAssessment;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.enums.RiskLevel;
import org.junit.jupiter.api.Test;

class AttritionRiskScorerTest {
    private final AttritionRiskScorer scorer = new AttritionRiskScorer();
    @Test
    void lowRiskWhenSignalsAreHealthy() {
        EmployeeWorkforceSnapshot snapshot = EmployeeWorkforceSnapshot.fromRequest(new AttritionPredictRequest(
                1L,
                "Alex",
                "HR",
                18,
                "ACTIVE",
                4.5,
                3,
                5,
                0,
                0,
                22,
                null));

        AttritionRiskAssessment assessment = scorer.assess(snapshot);
        assertThat(assessment.riskLevel()).isEqualTo(RiskLevel.LOW);
        assertThat(assessment.riskScore()).isLessThan(34);
    }

    @Test
    void highRiskWhenPerformanceAndAbsenteeismArePoor() {
        EmployeeWorkforceSnapshot snapshot = EmployeeWorkforceSnapshot.fromRequest(new AttritionPredictRequest(
                2L,
                "Sam",
                "Engineering",
                10,
                "ACTIVE",
                2.0,
                2,
                22,
                2,
                6,
                14,
                null));

        AttritionRiskAssessment assessment = scorer.assess(snapshot);
        assertThat(assessment.riskLevel()).isEqualTo(RiskLevel.HIGH);
        assertThat(assessment.riskFactors()).isNotEmpty();
    }
}
