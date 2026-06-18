package nexusHR.insights.repository;
import java.time.Instant;
import java.util.List;
import nexusHR.insights.entity.WorkforceReportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
public interface WorkforceReportScheduleRepository extends JpaRepository<WorkforceReportSchedule, Long> {
    List<WorkforceReportSchedule> findByCreatedByEmailOrderByCreatedAtDesc(String createdByEmail);
    List<WorkforceReportSchedule> findByEnabledTrueAndNextRunAtLessThanEqual(Instant now);
}
