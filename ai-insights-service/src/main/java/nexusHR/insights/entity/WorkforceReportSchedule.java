package nexusHR.insights.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import nexusHR.insights.enums.ReportFormat;
import nexusHR.insights.enums.ReportFrequency;

@Entity
@Table(name = "workforce_report_schedules")
@Getter
@Setter
public class WorkforceReportSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail;

    @Column(nullable = false)
    private String createdByEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportFrequency frequency;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_format", nullable = false, length = 20)
    private ReportFormat reportFormat;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private Instant nextRunAt;

    private Instant lastRunAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
