package nexusHR.performance.dto;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import nexusHR.performance.enums.FeedbackStatus;
import nexusHR.performance.enums.FeedbackType;
import nexusHR.performance.entity.PerformanceFeedback;
public record FeedbackResponse(
        Long id,
        Long reviewId,
        Long employeeId,
        String respondentEmail,
        FeedbackType feedbackType,
        FeedbackStatus status,
        String summaryComment,
        BigDecimal overallRating,
        Instant submittedAt,
        List<RatingResponse> ratings) {

    public static FeedbackResponse from(PerformanceFeedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getReview().getId(),
                feedback.getReview().getEmployeeId(),
                feedback.getRespondentEmail(),
                feedback.getFeedbackType(),
                feedback.getStatus(),
                feedback.getSummaryComment(),
                feedback.getOverallRating(),
                feedback.getSubmittedAt(),
                feedback.getRatings().stream().map(RatingResponse::fromFeedback).toList());
    }
}
