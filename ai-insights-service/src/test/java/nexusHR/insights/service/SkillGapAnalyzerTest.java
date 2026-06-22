package nexusHR.insights.service;
import static org.assertj.core.api.Assertions.assertThat;
import java.util.Map;
import nexusHR.insights.dto.AttritionPredictRequest;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.enums.GapPriority;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class SkillGapAnalyzerTest {
    private final SkillGapAnalyzer analyzer = new SkillGapAnalyzer();
    SkillGapAnalyzerTest() {
        ReflectionTestUtils.setField(analyzer, "targetScore", 4.0);
    }

    @Test
    void identifiesSkillGapsBelowTarget() {
        var response = analyzer.analyze(EmployeeWorkforceSnapshot.fromRequest(new AttritionPredictRequest(
                1L,
                "Jane",
                "Engineering",
                12,
                "ACTIVE",
                3.2,
                2,
                5,
                0,
                0,
                20,
                Map.of(
                        "TECHNICAL_SKILLS", 3.0,
                        "COMMUNICATION", 4.5,
                        "TEAMWORK", 3.2,
                        "DELIVERY", 3.8,
                        "INITIATIVE", 4.1))));

        assertThat(response.gapCount()).isEqualTo(3);
        assertThat(response.gaps().getFirst().priority()).isIn(GapPriority.HIGH, GapPriority.CRITICAL, GapPriority.MEDIUM);
        assertThat(response.developmentPlan()).isNotEmpty();
    }

    @Test
    void noGapsWhenAllSkillsMeetTarget() {
        var response = analyzer.analyze(EmployeeWorkforceSnapshot.fromRequest(new AttritionPredictRequest(
                2L,
                "Chris",
                "HR",
                24,
                "ACTIVE",
                4.4,
                3,
                6,
                0,
                0,
                21,
                Map.of(
                        "TECHNICAL_SKILLS", 4.2,
                        "COMMUNICATION", 4.6,
                        "TEAMWORK", 4.0,
                        "DELIVERY", 4.3,
                        "INITIATIVE", 4.5))));

        assertThat(response.gapCount()).isZero();
        assertThat(response.overallReadinessPercent()).isGreaterThanOrEqualTo(80);
    }
}
