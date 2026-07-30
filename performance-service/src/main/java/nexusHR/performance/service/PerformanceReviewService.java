package nexusHR.performance.service;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import nexusHR.performance.enums.FeedbackStatus;
import nexusHR.performance.enums.FeedbackType;
import nexusHR.performance.enums.RatingCriterion;
import nexusHR.performance.enums.ReviewStatus;
import nexusHR.performance.dto.CreateReviewRequest;
import nexusHR.performance.dto.NotificationDispatchPayload;
import nexusHR.performance.dto.RatingItemRequest;
import nexusHR.performance.dto.ReviewResponse;
import nexusHR.performance.dto.ScorecardResponse;
import nexusHR.performance.dto.SetRatingsRequest;
import nexusHR.performance.dto.TrendPointResponse;
import nexusHR.performance.dto.UpdateReviewRequest;
import nexusHR.performance.entity.PerformanceFeedback;
import nexusHR.performance.entity.PerformanceFeedbackRating;
import nexusHR.performance.entity.PerformanceRating;
import nexusHR.performance.entity.PerformanceReview;
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
public class PerformanceReviewService {
    private final PerformanceReviewRepository reviewRepository;
    private final PerformanceFeedbackRepository feedbackRepository;
    private final PerformanceFeedbackService feedbackService;
    private final EmployeeServiceClient employeeServiceClient;
    private final NotificationClient notificationClient;

    @Transactional
    public ReviewResponse create(CreateReviewRequest request, String reviewerEmail) {
        Long tenantId = TenantContext.requireTenantId();
        if (reviewRepository
                .findByTenantIdAndEmployeeIdAndReviewYearAndReviewQuarter(
                        tenantId, request.employeeId(), request.reviewYear(), request.reviewQuarter())
                .isPresent()) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Review already exists for employee "
                            + request.employeeId()
                            + " in Q"
                            + request.reviewQuarter()
                            + " "
                            + request.reviewYear());
        }
        var employee = employeeServiceClient.fetchEmployee(request.employeeId());
        String employeeEmail = request.employeeEmail() != null && !request.employeeEmail().isBlank()
                ? request.employeeEmail().trim().toLowerCase()
                : employee != null ? employee.email() : null;
        if (employeeEmail == null || employeeEmail.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Employee email is required. Ensure employee-service is running or pass employeeEmail.");
        }

        PerformanceReview review = new PerformanceReview();
        review.setTenantId(tenantId);
        review.setEmployeeId(request.employeeId());
        review.setReviewerEmail(reviewerEmail.toLowerCase());
        review.setReviewYear(request.reviewYear());
        review.setReviewQuarter(request.reviewQuarter());
        review.setGoals(request.goals());
        review.setStatus(ReviewStatus.DRAFT);
        PerformanceReview saved = reviewRepository.save(review);

        feedbackService.createDefaultSlots(saved, employeeEmail, reviewerEmail.toLowerCase());
        return ReviewResponse.from(saved);
    }

    @Transactional
    public ReviewResponse update(Long id, UpdateReviewRequest request) {
        PerformanceReview review = loadDraft(id);
        if (request.goals() != null) {
            review.setGoals(request.goals());
        }
        if (request.summaryComment() != null) {
            review.setSummaryComment(request.summaryComment());
        }
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse setRatings(Long id, SetRatingsRequest request) {
        PerformanceReview review = loadDraft(id);
        validateUniqueCriteria(request.ratings());

        review.getRatings().clear();
        for (RatingItemRequest item : request.ratings()) {
            PerformanceRating rating = new PerformanceRating();
            rating.setReview(review);
            rating.setCriterion(item.criterion());
            rating.setScore(item.score());
            rating.setComment(item.comment());
            review.getRatings().add(rating);
        }
        review.setOverallRating(RatingCalculator.overallAverage(review.getRatings()));
        feedbackService.syncManagerFeedbackFromReview(review, request);
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse submit(Long id) {
        PerformanceReview review = loadDraft(id);
        boolean hasManagerRatings = !review.getRatings().isEmpty()
                || feedbackRepository.findByReviewIdOrderByFeedbackTypeAscRespondentEmailAsc(id).stream()
                        .anyMatch(f -> f.getFeedbackType() == FeedbackType.MANAGER
                                && f.getStatus() == FeedbackStatus.SUBMITTED);
        if (!hasManagerRatings) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Add manager ratings before submitting the review");
        }
        if (review.getRatings().isEmpty()) {
            feedbackRepository
                    .findByReviewIdOrderByFeedbackTypeAscRespondentEmailAsc(id)
                    .stream()
                    .filter(f -> f.getFeedbackType() == FeedbackType.MANAGER && f.getStatus() == FeedbackStatus.SUBMITTED)
                    .findFirst()
                    .ifPresent(feedbackService::syncManagerRatingsToReviewViaFeedback);
        }
        review.setOverallRating(RatingCalculator.overallAverage(review.getRatings()));
        review.setStatus(ReviewStatus.SUBMITTED);
        review.setSubmittedAt(Instant.now());
        PerformanceReview saved = reviewRepository.save(review);

        var employee = employeeServiceClient.fetchEmployee(saved.getEmployeeId());
        if (employee != null && employee.email() != null) {
            notificationClient.dispatch(new NotificationDispatchPayload(
                    "USER",
                    employee.email(),
                    "Performance review submitted",
                    "Your manager submitted the Q"
                            + saved.getReviewQuarter()
                            + " "
                            + saved.getReviewYear()
                            + " review. Complete self-assessment and acknowledge when ready.",
                    "PERFORMANCE_REVIEW",
                    "REVIEW",
                    saved.getId()));
        }
        return ReviewResponse.from(saved);
    }

    @Transactional
    public ReviewResponse acknowledge(Long id) {
        PerformanceReview review = reviewRepository
                .findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
        if (review.getStatus() != ReviewStatus.SUBMITTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only submitted reviews can be acknowledged");
        }
        boolean selfSubmitted = feedbackRepository
                .findByReviewIdOrderByFeedbackTypeAscRespondentEmailAsc(id)
                .stream()
                .anyMatch(f -> f.getFeedbackType() == FeedbackType.SELF && f.getStatus() == FeedbackStatus.SUBMITTED);
        if (!selfSubmitted) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Submit your self-assessment before acknowledging the review");
        }
        review.setStatus(ReviewStatus.ACKNOWLEDGED);
        review.setAcknowledgedAt(Instant.now());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public ReviewResponse findById(Long id) {
        return reviewRepository
                .findByIdAndTenantId(id, TenantContext.requireTenantId())
                .map(ReviewResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findByEmployee(Long employeeId) {
        return reviewRepository
                .findByTenantIdAndEmployeeIdOrderByReviewYearDescReviewQuarterDesc(
                        TenantContext.requireTenantId(), employeeId)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ScorecardResponse scorecard(Long employeeId) {
        Long tenantId = TenantContext.requireTenantId();
        List<ReviewResponse> reviews = findByEmployee(employeeId).stream()
                .filter(r -> r.status() == ReviewStatus.SUBMITTED || r.status() == ReviewStatus.ACKNOWLEDGED)
                .toList();

        List<PerformanceReview> reviewEntities =
                reviewRepository
                        .findByTenantIdAndEmployeeIdOrderByReviewYearDescReviewQuarterDesc(tenantId, employeeId)
                        .stream()
                        .filter(r -> r.getStatus() == ReviewStatus.SUBMITTED || r.getStatus() == ReviewStatus.ACKNOWLEDGED)
                        .toList();

        List<PerformanceRating> legacyRatings = reviewEntities.stream()
                .flatMap(r -> r.getRatings().stream())
                .toList();
        List<PerformanceFeedbackRating> feedbackRatings = reviewEntities.stream()
                .flatMap(r -> r.getFeedback().stream())
                .filter(f -> f.getStatus() == FeedbackStatus.SUBMITTED)
                .flatMap(f -> f.getRatings().stream())
                .toList();

        List<PerformanceFeedbackRating> allFeedbackRatings = new ArrayList<>(feedbackRatings);
        Map<RatingCriterion, java.math.BigDecimal> byCriterion;
        if (!allFeedbackRatings.isEmpty()) {
            byCriterion = RatingCalculator.averageByCriterionFromFeedback(allFeedbackRatings);
        } else {
            byCriterion = RatingCalculator.averageByCriterion(legacyRatings);
        }

        Map<FeedbackType, List<PerformanceFeedbackRating>> byType = new EnumMap<>(FeedbackType.class);
        reviewEntities.stream()
                .flatMap(r -> r.getFeedback().stream())
                .filter(f -> f.getStatus() == FeedbackStatus.SUBMITTED)
                .forEach(f -> byType
                        .computeIfAbsent(f.getFeedbackType(), key -> new ArrayList<>())
                        .addAll(f.getRatings()));

        List<TrendPointResponse> trend = reviewEntities.stream()
                .sorted(Comparator.comparing(PerformanceReview::getReviewYear).thenComparing(PerformanceReview::getReviewQuarter))
                .map(r -> new TrendPointResponse(r.getReviewYear(), r.getReviewQuarter(), r.getOverallRating()))
                .toList();

        Double avgOverall = reviewRepository.averageOverallRating(tenantId, employeeId).orElse(null);

        return ScorecardResponse.of(
                employeeId,
                reviews,
                avgOverall,
                byCriterion,
                RatingCalculator.averageByFeedbackType(byType),
                trend);
    }

    private PerformanceReview loadDraft(Long id) {
        PerformanceReview review = reviewRepository
                .findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
        if (review.getStatus() != ReviewStatus.DRAFT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Review can only be edited while in DRAFT status");
        }
        return review;
    }

    private static void validateUniqueCriteria(List<RatingItemRequest> ratings) {
        Set<nexusHR.performance.enums.RatingCriterion> seen = new HashSet<>();
        for (RatingItemRequest item : ratings) {
            if (!seen.add(item.criterion())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Duplicate rating criterion: " + item.criterion());
            }
        }
    }
}
