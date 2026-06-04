package nexusHR.performance.dto;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import nexusHR.performance.enums.ReviewStatus;
import nexusHR.performance.entity.PerformanceReview;

public record ReviewResponse(
        Long id,
        Long employeeId,
        String reviewerEmail,
        Integer reviewYear,
        Integer reviewQuarter,
        String goals,
        String summaryComment,
        BigDecimal overallRating,
        ReviewStatus status,
        Instant submittedAt,
        Instant acknowledgedAt,
        List<RatingResponse> ratings) {

    public static ReviewResponse from(PerformanceReview review) {
        List<RatingResponse> ratings = review.getRatings().stream()
                .map(RatingResponse::from)
                .toList();
        return new ReviewResponse(
                review.getId(),
                review.getEmployeeId(),
                review.getReviewerEmail(),
                review.getReviewYear(),
                review.getReviewQuarter(),
                review.getGoals(),
                review.getSummaryComment(),
                review.getOverallRating(),
                review.getStatus(),
                review.getSubmittedAt(),
                review.getAcknowledgedAt(),
                ratings);
    }
}
