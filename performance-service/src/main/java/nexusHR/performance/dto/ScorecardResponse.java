package nexusHR.performance.dto;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import nexusHR.performance.enums.RatingCriterion;
public record ScorecardResponse(
        Long employeeId,
        int totalReviews,
        BigDecimal averageOverallRating,
        Map<RatingCriterion, BigDecimal> averageByCriterion,
        List<ReviewResponse> recentReviews) {

    public static ScorecardResponse of(
            Long employeeId,
            List<ReviewResponse> reviews,
            Double avgOverall,
            Map<RatingCriterion, BigDecimal> avgByCriterion) {
        BigDecimal overall = avgOverall == null
                ? null
                : BigDecimal.valueOf(avgOverall).setScale(2, RoundingMode.HALF_UP);
        return new ScorecardResponse(employeeId, reviews.size(), overall, avgByCriterion, reviews);
    }
}
