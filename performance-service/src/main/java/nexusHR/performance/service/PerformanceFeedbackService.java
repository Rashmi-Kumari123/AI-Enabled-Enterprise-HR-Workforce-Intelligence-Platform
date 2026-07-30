package nexusHR.performance.service;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import nexusHR.performance.dto.FeedbackResponse;
import nexusHR.performance.dto.InviteFeedbackRequest;
import nexusHR.performance.dto.NotificationDispatchPayload;
import nexusHR.performance.dto.RatingItemRequest;
import nexusHR.performance.dto.SetRatingsRequest;
import nexusHR.performance.dto.SubmitFeedbackRequest;
import nexusHR.performance.entity.PerformanceFeedback;
import nexusHR.performance.entity.PerformanceFeedbackRating;
import nexusHR.performance.entity.PerformanceReview;
import nexusHR.performance.enums.FeedbackStatus;
import nexusHR.performance.enums.FeedbackType;
import nexusHR.performance.enums.ReviewStatus;
import nexusHR.performance.exception.ApiException;
import nexusHR.performance.integration.EmployeeServiceClient;
import nexusHR.performance.integration.NotificationClient;
import nexusHR.performance.repository.PerformanceFeedbackRepository;
import nexusHR.performance.repository.PerformanceReviewRepository;
import nexusHR.common.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PerformanceFeedbackService {
    private final PerformanceFeedbackRepository feedbackRepository;
    private final PerformanceReviewRepository reviewRepository;
    private final NotificationClient notificationClient;
    private final EmployeeServiceClient employeeServiceClient;

    @Transactional
    public void createDefaultSlots(PerformanceReview review, String employeeEmail, String managerEmail) {
        createSlot(review, employeeEmail, FeedbackType.SELF);
        createSlot(review, managerEmail, FeedbackType.MANAGER);
        notifyFeedbackRequest(employeeEmail, review, "Complete your self-assessment");
        notifyFeedbackRequest(managerEmail, review, "Complete manager review ratings");
    }
    @Transactional
    public List<FeedbackResponse> invite(Long reviewId, InviteFeedbackRequest request) {
        PerformanceReview review = loadReview(reviewId);
        if (review.getStatus() != ReviewStatus.DRAFT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Feedback can only be invited while review is in DRAFT");
        }
        if (request.feedbackType() != FeedbackType.PEER && request.feedbackType() != FeedbackType.DIRECT_REPORT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only PEER or DIRECT_REPORT invitations are supported");
        }
        for (String email : request.emails()) {
            String normalized = email.trim().toLowerCase();
            if (normalized.isBlank()) {
                continue;
            }
            if (feedbackRepository.findByReviewIdAndRespondentEmail(reviewId, normalized).isPresent()) {
                continue;
            }
            createSlot(review, normalized, request.feedbackType());
            notifyFeedbackRequest(normalized, review, "You have been invited to provide " + request.feedbackType() + " feedback");
        }
        return listByReview(reviewId);
    }

    @Transactional
    public FeedbackResponse setRatings(Long feedbackId, SetRatingsRequest request, String authEmail) {
        PerformanceFeedback feedback = loadPendingFeedback(feedbackId, authEmail);
        validateUniqueCriteria(request.ratings());
        feedback.getRatings().clear();
        for (RatingItemRequest item : request.ratings()) {
            PerformanceFeedbackRating rating = new PerformanceFeedbackRating();
            rating.setFeedback(feedback);
            rating.setCriterion(item.criterion());
            rating.setScore(item.score());
            rating.setComment(item.comment());
            feedback.getRatings().add(rating);
        }
        feedback.setOverallRating(RatingCalculator.overallAverageFeedback(feedback.getRatings()));
        return FeedbackResponse.from(feedbackRepository.save(feedback));
    }

    @Transactional
    public FeedbackResponse submit(Long feedbackId, SubmitFeedbackRequest request, String authEmail) {
        PerformanceFeedback feedback = loadPendingFeedback(feedbackId, authEmail);
        if (feedback.getRatings().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Add ratings before submitting feedback");
        }
        if (request != null && request.summaryComment() != null) {
            feedback.setSummaryComment(request.summaryComment());
        }
        feedback.setOverallRating(RatingCalculator.overallAverageFeedback(feedback.getRatings()));
        feedback.setStatus(FeedbackStatus.SUBMITTED);
        feedback.setSubmittedAt(Instant.now());
        PerformanceFeedback saved = feedbackRepository.save(feedback);

        if (feedback.getFeedbackType() == FeedbackType.MANAGER) {
            syncManagerRatingsToReview(saved);
        }

        PerformanceReview review = saved.getReview();
        if (feedback.getFeedbackType() == FeedbackType.SELF && review.getStatus() == ReviewStatus.SUBMITTED) {
            notifyEmployeeToAcknowledge(review);
        }

        return FeedbackResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> listByReview(Long reviewId) {
        return feedbackRepository.findByReviewIdOrderByFeedbackTypeAscRespondentEmailAsc(reviewId).stream()
                .map(FeedbackResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> listPendingForUser(String email) {
        return feedbackRepository
                .findByRespondentEmailAndStatusOrderByCreatedAtDesc(email.toLowerCase(), FeedbackStatus.PENDING)
                .stream()
                .map(FeedbackResponse::from)
                .toList();
    }

    @Transactional
    public void syncManagerFeedbackFromReview(PerformanceReview review, SetRatingsRequest request) {
        PerformanceFeedback managerFeedback = feedbackRepository
                .findByReviewIdAndRespondentEmail(review.getId(), review.getReviewerEmail().toLowerCase())
                .orElseGet(() -> createSlot(review, review.getReviewerEmail(), FeedbackType.MANAGER));

        managerFeedback.getRatings().clear();
        for (RatingItemRequest item : request.ratings()) {
            PerformanceFeedbackRating rating = new PerformanceFeedbackRating();
            rating.setFeedback(managerFeedback);
            rating.setCriterion(item.criterion());
            rating.setScore(item.score());
            rating.setComment(item.comment());
            managerFeedback.getRatings().add(rating);
        }
        managerFeedback.setOverallRating(RatingCalculator.overallAverageFeedback(managerFeedback.getRatings()));
        if (managerFeedback.getStatus() == FeedbackStatus.SUBMITTED) {
            managerFeedback.setSubmittedAt(Instant.now());
        }
        feedbackRepository.save(managerFeedback);
    }

    @Transactional
    public void syncManagerRatingsToReviewViaFeedback(PerformanceFeedback managerFeedback) {
        syncManagerRatingsToReview(managerFeedback);
    }

    private void syncManagerRatingsToReview(PerformanceFeedback managerFeedback) {
        PerformanceReview review = managerFeedback.getReview();
        review.getRatings().clear();
        for (PerformanceFeedbackRating item : managerFeedback.getRatings()) {
            var rating = new nexusHR.performance.entity.PerformanceRating();
            rating.setReview(review);
            rating.setCriterion(item.getCriterion());
            rating.setScore(item.getScore());
            rating.setComment(item.getComment());
            review.getRatings().add(rating);
        }
        review.setOverallRating(RatingCalculator.overallAverage(review.getRatings()));
        reviewRepository.save(review);
    }
    private PerformanceFeedback createSlot(PerformanceReview review, String email, FeedbackType type) {
        PerformanceFeedback feedback = new PerformanceFeedback();
        feedback.setReview(review);
        feedback.setRespondentEmail(email.trim().toLowerCase());
        feedback.setFeedbackType(type);
        feedback.setStatus(FeedbackStatus.PENDING);
        review.getFeedback().add(feedback);
        return feedbackRepository.save(feedback);
    }
    private PerformanceReview loadReview(Long reviewId) {
        return reviewRepository
                .findByIdAndTenantId(reviewId, TenantContext.requireTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
    }
    private PerformanceFeedback loadPendingFeedback(Long feedbackId, String authEmail) {
        PerformanceFeedback feedback = feedbackRepository
                .findById(feedbackId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Feedback not found"));
        if (!feedback.getRespondentEmail().equalsIgnoreCase(authEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only submit your own feedback");
        }
        if (feedback.getStatus() != FeedbackStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Feedback has already been submitted");
        }
        if (!feedback.getReview().getTenantId().equals(TenantContext.requireTenantId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Feedback not found");
        }
        return feedback;
    }
    private static void validateUniqueCriteria(List<RatingItemRequest> ratings) {
        Set<nexusHR.performance.enums.RatingCriterion> seen = new HashSet<>();
        for (RatingItemRequest item : ratings) {
            if (!seen.add(item.criterion())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Duplicate rating criterion: " + item.criterion());
            }
        }
    }
    private void notifyFeedbackRequest(String email, PerformanceReview review, String message) {
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                email,
                "Performance feedback requested",
                message + " for Q" + review.getReviewQuarter() + " " + review.getReviewYear(),
                "PERFORMANCE_REVIEW",
                "REVIEW",
                review.getId()));
    }
    private void notifyEmployeeToAcknowledge(PerformanceReview review) {
        var employee = employeeServiceClient.fetchEmployee(review.getEmployeeId());
        if (employee == null || employee.email() == null) {
            return;
        }
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                employee.email(),
                "Please acknowledge your review",
                "Your performance review for Q"
                        + review.getReviewQuarter()
                        + " "
                        + review.getReviewYear()
                        + " is ready for acknowledgement.",
                "PERFORMANCE_REVIEW",
                "REVIEW",
                review.getId()));
    }
}
