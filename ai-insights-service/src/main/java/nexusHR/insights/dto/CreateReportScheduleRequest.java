package nexusHR.insights.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import nexusHR.insights.enums.ReportFormat;
import nexusHR.insights.enums.ReportFrequency;
public record CreateReportScheduleRequest(
        @Email String recipientEmail,
        @NotNull ReportFrequency frequency,
        @NotNull ReportFormat reportFormat) {}
