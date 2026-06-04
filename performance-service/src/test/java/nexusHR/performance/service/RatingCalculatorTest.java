package nexusHR.performance.service;
import static org.assertj.core.api.Assertions.assertThat;
import java.util.List;
import nexusHR.performance.enums.RatingCriterion;
import nexusHR.performance.entity.PerformanceRating;
import org.junit.jupiter.api.Test;

class RatingCalculatorTest {
    @Test
    void computesOverallAverage() {
        PerformanceRating r1 = rating(RatingCriterion.TECHNICAL_SKILLS, 4);
        PerformanceRating r2 = rating(RatingCriterion.COMMUNICATION, 5);
        PerformanceRating r3 = rating(RatingCriterion.TEAMWORK, 3);

        assertThat(RatingCalculator.overallAverage(List.of(r1, r2, r3)))
                .isEqualByComparingTo("4.00");
    }
    private static PerformanceRating rating(RatingCriterion criterion, int score) {
        PerformanceRating rating = new PerformanceRating();
        rating.setCriterion(criterion);
        rating.setScore(score);
        return rating;
    }
}
