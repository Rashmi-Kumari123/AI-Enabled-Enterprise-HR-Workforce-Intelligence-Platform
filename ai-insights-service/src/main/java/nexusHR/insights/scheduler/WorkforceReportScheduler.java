package nexusHR.insights.scheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.insights.service.WorkforceReportScheduleService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
@Slf4j
@Component
@RequiredArgsConstructor
public class WorkforceReportScheduler {
    private final WorkforceReportScheduleService scheduleService;
    @Value("${app.reports.scheduler.enabled:true}")
    private boolean enabled;

    @Scheduled(cron = "${app.reports.scheduler.cron:0 0 8 * * *}")
    public void runDueReports() {
        if (!enabled) {
            return;
        }
        try {
            scheduleService.runDueSchedules();
            log.debug("Workforce report scheduler tick completed");
        } catch (Exception ex) {
            log.warn("Workforce report scheduler failed: {}", ex.getMessage());
        }
    }
}
