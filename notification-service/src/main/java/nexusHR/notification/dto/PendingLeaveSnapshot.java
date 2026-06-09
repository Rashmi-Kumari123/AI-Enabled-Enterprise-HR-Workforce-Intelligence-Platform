package nexusHR.notification.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;
@JsonIgnoreProperties(ignoreUnknown = true)
public record PendingLeaveSnapshot(
        Long id,
        Long employeeId,
        String employeeEmail,
        String employeePhone,
        String leaveType,
        String status,
        Instant submittedAt) {}
