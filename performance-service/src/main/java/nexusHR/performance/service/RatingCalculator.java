package nexusHR.performance.service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import nexusHR.performance.enums.RatingCriterion;
import nexusHR.performance.entity.PerformanceRating;

public final class RatingCalculator {
    private static final int SCALE = 2;
    private RatingCalculator() {}
    public static BigDecimal overallAverage(List<PerformanceRating> ratings) {
        if (ratings == null || ratings.isEmpty()) {
            return null;
        }
        double avg = ratings.stream().mapToInt(PerformanceRating::getScore).average().orElse(0);
        return BigDecimal.valueOf(avg).setScale(SCALE, RoundingMode.HALF_UP);
    }
    public static Map<RatingCriterion, BigDecimal> averageByCriterion(List<PerformanceRating> allRatings) {
        Map<RatingCriterion, BigDecimal> result = new EnumMap<>(RatingCriterion.class);
        for (RatingCriterion criterion : RatingCriterion.values()) {
            double avg = allRatings.stream()
                    .filter(r -> r.getCriterion() == criterion)
                    .mapToInt(PerformanceRating::getScore)
                    .average()
                    .orElse(Double.NaN);
            if (!Double.isNaN(avg)) {
                result.put(criterion, BigDecimal.valueOf(avg).setScale(SCALE, RoundingMode.HALF_UP));
            }
        }
        return result;
    }
}
