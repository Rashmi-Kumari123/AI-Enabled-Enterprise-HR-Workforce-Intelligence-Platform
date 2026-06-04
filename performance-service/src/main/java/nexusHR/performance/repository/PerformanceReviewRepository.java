package nexusHR.performance.repository;
import java.util.List;
import java.util.Optional;
import nexusHR.performance.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    Optional<PerformanceReview> findByEmployeeIdAndReviewYearAndReviewQuarter(
            Long employeeId, Integer reviewYear, Integer reviewQuarter);

    List<PerformanceReview> findByEmployeeIdOrderByReviewYearDescReviewQuarterDesc(Long employeeId);
    @Query(
            """
            SELECT AVG(r.overallRating) FROM PerformanceReview r
            WHERE r.employeeId = :employeeId AND r.status IN ('SUBMITTED', 'ACKNOWLEDGED')
            """)
    Optional<Double> averageOverallRating(@Param("employeeId") Long employeeId);
}
