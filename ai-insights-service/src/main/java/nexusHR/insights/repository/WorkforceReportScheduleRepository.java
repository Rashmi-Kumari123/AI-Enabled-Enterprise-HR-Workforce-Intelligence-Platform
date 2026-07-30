package nexusHR.insights.repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import nexusHR.insights.entity.WorkforceReportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkforceReportScheduleRepository extends JpaRepository<WorkforceReportSchedule, Long> {
    List<WorkforceReportSchedule> findByTenantIdAndCreatedByEmailOrderByCreatedAtDesc(
            Long tenantId, String createdByEmail);

    List<WorkforceReportSchedule> findByEnabledTrueAndNextRunAtLessThanEqual(Instant now);

    Optional<WorkforceReportSchedule> findByIdAndTenantId(Long id, Long tenantId);
}
