package nexusHR.performance.dto;
import nexusHR.performance.enums.RatingCriterion;
import nexusHR.performance.entity.PerformanceFeedbackRating;
import nexusHR.performance.entity.PerformanceRating;

public record RatingResponse(
        Long id, RatingCriterion criterion, Integer score, String comment) {
    public static RatingResponse from(PerformanceRating rating) {
        return new RatingResponse(
                rating.getId(), rating.getCriterion(), rating.getScore(), rating.getComment());
    }
    public static RatingResponse fromFeedback(PerformanceFeedbackRating rating) {
        return new RatingResponse(
                rating.getId(), rating.getCriterion(), rating.getScore(), rating.getComment());
    }
}
