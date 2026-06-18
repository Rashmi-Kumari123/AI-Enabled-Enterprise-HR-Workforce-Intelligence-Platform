package nexusHR.insights.controller;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.insights.dto.CreateReportScheduleRequest;
import nexusHR.insights.dto.ReportScheduleResponse;
import nexusHR.insights.enums.ReportFormat;
import nexusHR.insights.service.WorkforceReportScheduleService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/v1/ai/reports")
@RequiredArgsConstructor
public class WorkforceReportController {
    private final WorkforceReportScheduleService scheduleService;
    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<byte[]> exportCsv(Authentication authentication) {
        return export(ReportFormat.CSV, authentication);
    }
    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<byte[]> exportExcel(Authentication authentication) {
        return export(ReportFormat.EXCEL, authentication);
    }
    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<byte[]> exportPdf(Authentication authentication) {
        return export(ReportFormat.PDF, authentication);
    }
    @GetMapping("/schedules")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public List<ReportScheduleResponse> listSchedules(Authentication authentication) {
        return scheduleService.listForUser(authentication.getName());
    }
    @PostMapping("/schedules")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ReportScheduleResponse createSchedule(
            Authentication authentication, @Valid @RequestBody CreateReportScheduleRequest request) {
        return scheduleService.create(authentication.getName(), request);
    }
    @DeleteMapping("/schedules/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id, Authentication authentication) {
        scheduleService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/schedules/{id}/run-now")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Void> runScheduleNow(@PathVariable Long id, Authentication authentication) {
        scheduleService.runNow(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
    private ResponseEntity<byte[]> export(ReportFormat format, Authentication authentication) {
        byte[] bytes = scheduleService.export(format, authentication.getName());
        String date = LocalDate.now().toString();
        String filename =
                switch (format) {
                    case CSV -> "nexushr-workforce-analytics-" + date + ".csv";
                    case EXCEL -> "nexushr-workforce-analytics-" + date + ".xlsx";
                    case PDF -> "nexushr-workforce-analytics-" + date + ".pdf";
                };
        MediaType mediaType =
                switch (format) {
                    case CSV -> MediaType.parseMediaType("text/csv");
                    case EXCEL -> MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    case PDF -> MediaType.APPLICATION_PDF;
                };
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(bytes);
    }
}
