package nexusHR.insights.service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.insights.dto.CreateReportScheduleRequest;
import nexusHR.insights.dto.NotificationDispatchPayload;
import nexusHR.insights.dto.ReportScheduleResponse;
import nexusHR.insights.dto.WorkforceAnalyticsResponse;
import nexusHR.insights.entity.WorkforceReportSchedule;
import nexusHR.insights.enums.ReportFormat;
import nexusHR.insights.enums.ReportFrequency;
import nexusHR.insights.exception.ApiException;
import nexusHR.insights.integration.NotificationClient;
import nexusHR.insights.repository.WorkforceReportScheduleRepository;
import nexusHR.insights.security.JwtRequestContext;
import nexusHR.insights.security.JwtService;
import nexusHR.common.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WorkforceReportScheduleService {
    private final WorkforceReportScheduleRepository repository;
    private final WorkforceAnalyticsService workforceAnalyticsService;
    private final WorkforceReportExporter reportExporter;
    private final NotificationClient notificationClient;
    private final JwtService jwtService;
    @Transactional(readOnly = true)
    public List<ReportScheduleResponse> listForUser(String email) {
        return repository
                .findByTenantIdAndCreatedByEmailOrderByCreatedAtDesc(TenantContext.requireTenantId(), email)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    @Transactional
    public ReportScheduleResponse create(String creatorEmail, CreateReportScheduleRequest request) {
        String recipient = request.recipientEmail() == null || request.recipientEmail().isBlank()
                ? creatorEmail
                : request.recipientEmail().trim();

        WorkforceReportSchedule schedule = new WorkforceReportSchedule();
        schedule.setTenantId(TenantContext.requireTenantId());
        schedule.setRecipientEmail(recipient);
        schedule.setCreatedByEmail(creatorEmail);
        schedule.setFrequency(request.frequency());
        schedule.setReportFormat(request.reportFormat());
        schedule.setEnabled(true);
        schedule.setNextRunAt(computeNextRun(request.frequency(), Instant.now()));
        schedule.setCreatedAt(Instant.now());
        return toResponse(repository.save(schedule));
    }
    @Transactional
    public void delete(Long id, String creatorEmail) {
        WorkforceReportSchedule schedule = repository
                .findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report schedule not found"));
        if (!schedule.getCreatedByEmail().equalsIgnoreCase(creatorEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot delete another user's schedule");
        }
        repository.delete(schedule);
    }
    @Transactional
    public void runDueSchedules() {
        Instant now = Instant.now();
        for (WorkforceReportSchedule schedule : repository.findByEnabledTrueAndNextRunAtLessThanEqual(now)) {
            TenantContext.setTenantId(schedule.getTenantId());
            try {
                deliverSchedule(schedule);
                schedule.setLastRunAt(now);
                schedule.setNextRunAt(computeNextRun(schedule.getFrequency(), now));
                repository.save(schedule);
            } finally {
                TenantContext.clear();
            }
        }
    }
    @Transactional
    public void runNow(Long id, String creatorEmail) {
        WorkforceReportSchedule schedule = repository
                .findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report schedule not found"));
        if (!schedule.getCreatedByEmail().equalsIgnoreCase(creatorEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot run another user's schedule");
        }
        deliverSchedule(schedule);
        schedule.setLastRunAt(Instant.now());
        repository.save(schedule);
    }
    public byte[] export(ReportFormat format, String requesterEmail) {
        WorkforceAnalyticsResponse analytics = analyticsWithServiceToken(requesterEmail);
        return switch (format) {
            case CSV -> reportExporter.toCsv(analytics);
            case EXCEL -> reportExporter.toExcel(analytics);
            case PDF -> reportExporter.toPdf(analytics);
        };
    }
    private void deliverSchedule(WorkforceReportSchedule schedule) {
        WorkforceAnalyticsResponse analytics = analyticsWithServiceToken(schedule.getRecipientEmail());
        String body = reportExporter.buildEmailBody(analytics);
        String formatLabel = schedule.getReportFormat().name();
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                schedule.getRecipientEmail(),
                "NexusHR " + formatLabel + " workforce report",
                body + "\n\nScheduled format: " + formatLabel + ".",
                "WORKFORCE_REPORT",
                "WORKFORCE_REPORT",
                schedule.getId()));
    }
    private WorkforceAnalyticsResponse analyticsWithServiceToken(String email) {
        String token = jwtService.createHrServiceToken(email);
        try {
            JwtRequestContext.setToken(token);
            return workforceAnalyticsService.getWorkforceAnalytics();
        } finally {
            JwtRequestContext.clear();
        }
    }
    private Instant computeNextRun(ReportFrequency frequency, Instant from) {
        return switch (frequency) {
            case WEEKLY -> from.plus(7, ChronoUnit.DAYS);
            case MONTHLY -> from.plus(30, ChronoUnit.DAYS);
        };
    }
    private ReportScheduleResponse toResponse(WorkforceReportSchedule schedule) {
        return new ReportScheduleResponse(
                schedule.getId(),
                schedule.getRecipientEmail(),
                schedule.getCreatedByEmail(),
                schedule.getFrequency(),
                schedule.getReportFormat(),
                schedule.isEnabled(),
                schedule.getNextRunAt(),
                schedule.getLastRunAt(),
                schedule.getCreatedAt());
    }
}
