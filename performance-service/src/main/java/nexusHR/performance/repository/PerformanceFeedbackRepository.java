package nexusHR.performance.repository;
import java.util.List;
import java.util.Optional;
import nexusHR.performance.entity.PerformanceFeedback;
import nexusHR.performance.enums.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PerformanceFeedbackRepository extends JpaRepository<PerformanceFeedback, Long> {
    List<PerformanceFeedback> findByReviewIdOrderByFeedbackTypeAscRespondentEmailAsc(Long reviewId);
    List<PerformanceFeedback> findByRespondentEmailAndStatusOrderByCreatedAtDesc(String respondentEmail, FeedbackStatus status);
    Optional<PerformanceFeedback> findByReviewIdAndRespondentEmail(Long reviewId, String respondentEmail);
}
