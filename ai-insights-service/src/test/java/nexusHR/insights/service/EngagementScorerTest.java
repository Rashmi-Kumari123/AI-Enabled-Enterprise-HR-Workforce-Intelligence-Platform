package nexusHR.insights.service;
import static org.assertj.core.api.Assertions.assertThat;
import java.util.Map;
import nexusHR.insights.dto.AttritionPredictRequest;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.enums.EngagementLevel;
import org.junit.jupiter.api.Test;

class EngagementScorerTest {
    private final EngagementScorer scorer = new EngagementScorer();
    @Test
    void highEngagementForHealthySignals() {
        var response = scorer.assess(EmployeeWorkforceSnapshot.fromRequest(new AttritionPredictRequest(
                1L,
                "Alex",
                "Engineering",
                18,
                "ACTIVE",
                4.6,
                3,
                8,
                0,
                0,
                22,
                null)));
        assertThat(response.engagementLevel()).isEqualTo(EngagementLevel.HIGH);
        assertThat(response.engagementScore()).isGreaterThanOrEqualTo(70);
    }
    @Test
    void lowEngagementForPoorAttendanceAndPerformance() {
        var response = scorer.assess(EmployeeWorkforceSnapshot.fromRequest(new AttritionPredictRequest(
                2L,
                "Sam",
                "Sales",
                4,
                "ACTIVE",
                2.1,
                1,
                30,
                2,
                8,
                10,
                null)));
        assertThat(response.engagementLevel()).isIn(EngagementLevel.LOW, EngagementLevel.MODERATE);
        assertThat(response.recommendations()).isNotEmpty();
    }
}
