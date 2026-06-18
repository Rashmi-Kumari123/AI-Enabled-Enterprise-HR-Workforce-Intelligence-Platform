package nexusHR.performance.config;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.performance.dto.CreateReviewRequest;
import nexusHR.performance.dto.InviteFeedbackRequest;
import nexusHR.performance.dto.RatingItemRequest;
import nexusHR.performance.dto.SetRatingsRequest;
import nexusHR.performance.enums.FeedbackType;
import nexusHR.performance.enums.RatingCriterion;
import nexusHR.performance.integration.EmployeeServiceClient;
import nexusHR.performance.repository.PerformanceReviewRepository;
import nexusHR.performance.service.PerformanceFeedbackService;
import nexusHR.performance.service.PerformanceReviewService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.performance-seed-enabled", havingValue = "true", matchIfMissing = true)
public class DemoPerformanceInitializer implements ApplicationRunner {
    private final EmployeeServiceClient employeeServiceClient;
    private final PerformanceReviewRepository reviewRepository;
    private final PerformanceReviewService reviewService;
    private final PerformanceFeedbackService feedbackService;

    @Value("${app.demo.performance-seed-enabled:true}")
    private boolean seedEnabled;

    private static final List<RatingItemRequest> DEMO_RATINGS = List.of(
            new RatingItemRequest(RatingCriterion.TECHNICAL_SKILLS, 4, "Solid execution"),
            new RatingItemRequest(RatingCriterion.COMMUNICATION, 4, "Clear updates"),
            new RatingItemRequest(RatingCriterion.TEAMWORK, 5, "Great collaborator"),
            new RatingItemRequest(RatingCriterion.DELIVERY, 4, "Meets commitments"),
            new RatingItemRequest(RatingCriterion.INITIATIVE, 4, "Proactive"));

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            return;
        }
        var employee = employeeServiceClient.fetchActiveEmployees().stream()
                .filter(e -> "employee@nexushr.com".equalsIgnoreCase(e.email()))
                .findFirst()
                .or(() -> employeeServiceClient.fetchActiveEmployees().stream().findFirst())
                .orElse(null);
        if (employee == null) {
            log.info("Demo performance seed skipped: no employees found");
            return;
        }
        int year = Year.now().getValue();
        int quarter = ((LocalDate.now().getMonthValue() - 1) / 3) + 1;
        if (reviewRepository
                .findByEmployeeIdAndReviewYearAndReviewQuarter(employee.id(), year, quarter)
                .isPresent()) {
            return;
        }
        try {
            var review = reviewService.create(
                    new CreateReviewRequest(
                            employee.id(),
                            employee.email(),
                            year,
                            quarter,
                            "Deliver Q"
                                    + quarter
                                    + " roadmap items\nImprove cross-team communication\nMentor one junior teammate"),
                    "manager@nexushr.com");
            long managerFeedbackId = feedbackService.listByReview(review.id()).stream()
                    .filter(f -> f.feedbackType() == FeedbackType.MANAGER)
                    .findFirst()
                    .orElseThrow()
                    .id();
            feedbackService.setRatings(
                    managerFeedbackId, new SetRatingsRequest(DEMO_RATINGS), "manager@nexushr.com");
            feedbackService.submit(managerFeedbackId, null, "manager@nexushr.com");
            reviewService.submit(review.id());
            feedbackService.invite(
                    review.id(),
                    new InviteFeedbackRequest(FeedbackType.PEER, List.of("hr@nexushr.com")));

            log.info("Demo performance review seeded for employee {} Q{} {}", employee.id(), quarter, year);
        } catch (Exception ex) {
            log.warn("Demo performance seed skipped: {}", ex.getMessage());
        }
    }
}
