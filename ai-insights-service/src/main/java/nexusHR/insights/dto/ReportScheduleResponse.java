package nexusHR.insights.dto;
import java.time.Instant;
import nexusHR.insights.enums.ReportFormat;
import nexusHR.insights.enums.ReportFrequency;
public record ReportScheduleResponse(
        Long id,
        String recipientEmail,
        String createdByEmail,
        ReportFrequency frequency,
        ReportFormat reportFormat,
        boolean enabled,
        Instant nextRunAt,
        Instant lastRunAt,
        Instant createdAt) {}
