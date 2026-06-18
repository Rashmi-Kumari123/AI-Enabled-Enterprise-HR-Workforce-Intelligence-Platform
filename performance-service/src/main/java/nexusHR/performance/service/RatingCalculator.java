package nexusHR.performance.service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import nexusHR.performance.enums.FeedbackType;
import nexusHR.performance.enums.RatingCriterion;
import nexusHR.performance.entity.PerformanceFeedbackRating;
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
    public static BigDecimal overallAverageFeedback(List<PerformanceFeedbackRating> ratings) {
        if (ratings == null || ratings.isEmpty()) {
            return null;
        }
        double avg = ratings.stream().mapToInt(PerformanceFeedbackRating::getScore).average().orElse(0);
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

    public static Map<RatingCriterion, BigDecimal> averageByCriterionFromFeedback(
            List<PerformanceFeedbackRating> allRatings) {
        Map<RatingCriterion, BigDecimal> result = new EnumMap<>(RatingCriterion.class);
        for (RatingCriterion criterion : RatingCriterion.values()) {
            double avg = allRatings.stream()
                    .filter(r -> r.getCriterion() == criterion)
                    .mapToInt(PerformanceFeedbackRating::getScore)
                    .average()
                    .orElse(Double.NaN);
            if (!Double.isNaN(avg)) {
                result.put(criterion, BigDecimal.valueOf(avg).setScale(SCALE, RoundingMode.HALF_UP));
            }
        }
        return result;
    }
    public static Map<FeedbackType, BigDecimal> averageByFeedbackType(
            Map<FeedbackType, List<PerformanceFeedbackRating>> ratingsByType) {
        Map<FeedbackType, BigDecimal> result = new EnumMap<>(FeedbackType.class);
        for (Map.Entry<FeedbackType, List<PerformanceFeedbackRating>> entry : ratingsByType.entrySet()) {
            BigDecimal avg = overallAverageFeedback(entry.getValue());
            if (avg != null) {
                result.put(entry.getKey(), avg);
            }
        }
        return result;
    }
}
