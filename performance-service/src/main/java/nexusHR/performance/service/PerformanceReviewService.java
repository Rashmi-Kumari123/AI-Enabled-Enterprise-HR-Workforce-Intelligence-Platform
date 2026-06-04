package nexusHR.performance.service;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import nexusHR.performance.enums.RatingCriterion;
import nexusHR.performance.enums.ReviewStatus;
import nexusHR.performance.dto.CreateReviewRequest;
import nexusHR.performance.dto.RatingItemRequest;
import nexusHR.performance.dto.ReviewResponse;
import nexusHR.performance.dto.ScorecardResponse;
import nexusHR.performance.dto.SetRatingsRequest;
import nexusHR.performance.dto.UpdateReviewRequest;
import nexusHR.performance.entity.PerformanceRating;
import nexusHR.performance.entity.PerformanceReview;
import nexusHR.performance.exception.ApiException;
import nexusHR.performance.repository.PerformanceReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PerformanceReviewService {
    private final PerformanceReviewRepository reviewRepository;
    @Transactional
    public ReviewResponse create(CreateReviewRequest request, String reviewerEmail) {
        if (reviewRepository
                .findByEmployeeIdAndReviewYearAndReviewQuarter(
                        request.employeeId(), request.reviewYear(), request.reviewQuarter())
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
        PerformanceReview review = new PerformanceReview();
        review.setEmployeeId(request.employeeId());
        review.setReviewerEmail(reviewerEmail);
        review.setReviewYear(request.reviewYear());
        review.setReviewQuarter(request.reviewQuarter());
        review.setGoals(request.goals());
        review.setStatus(ReviewStatus.DRAFT);
        return ReviewResponse.from(reviewRepository.save(review));
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
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse submit(Long id) {
        PerformanceReview review = loadDraft(id);
        if (review.getRatings().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Add ratings before submitting the review");
        }
        review.setOverallRating(RatingCalculator.overallAverage(review.getRatings()));
        review.setStatus(ReviewStatus.SUBMITTED);
        review.setSubmittedAt(Instant.now());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse acknowledge(Long id) {
        PerformanceReview review = reviewRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
        if (review.getStatus() != ReviewStatus.SUBMITTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only submitted reviews can be acknowledged");
        }
        review.setStatus(ReviewStatus.ACKNOWLEDGED);
        review.setAcknowledgedAt(Instant.now());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public ReviewResponse findById(Long id) {
        return reviewRepository
                .findById(id)
                .map(ReviewResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> findByEmployee(Long employeeId) {
        return reviewRepository.findByEmployeeIdOrderByReviewYearDescReviewQuarterDesc(employeeId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ScorecardResponse scorecard(Long employeeId) {
        List<ReviewResponse> reviews = findByEmployee(employeeId).stream()
                .filter(r -> r.status() == ReviewStatus.SUBMITTED || r.status() == ReviewStatus.ACKNOWLEDGED)
                .toList();

        Double avgOverall = reviewRepository.averageOverallRating(employeeId).orElse(null);

        var allRatings = reviewRepository.findByEmployeeIdOrderByReviewYearDescReviewQuarterDesc(employeeId).stream()
                .filter(r -> r.getStatus() == ReviewStatus.SUBMITTED || r.getStatus() == ReviewStatus.ACKNOWLEDGED)
                .flatMap(r -> r.getRatings().stream())
                .toList();

        return ScorecardResponse.of(
                employeeId, reviews, avgOverall, RatingCalculator.averageByCriterion(allRatings));
    }
    private PerformanceReview loadDraft(Long id) {
        PerformanceReview review = reviewRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
        if (review.getStatus() != ReviewStatus.DRAFT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Review can only be edited while in DRAFT status");
        }
        return review;
    }
    private static void validateUniqueCriteria(List<RatingItemRequest> ratings) {
        Set<RatingCriterion> seen = new HashSet<>();
        for (RatingItemRequest item : ratings) {
            if (!seen.add(item.criterion())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Duplicate rating criterion: " + item.criterion());
            }
        }
    }
}
