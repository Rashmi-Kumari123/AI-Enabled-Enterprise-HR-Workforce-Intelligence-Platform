package nexusHR.leave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import nexusHR.common.enums.LeaveType;

public record LeaveSubmitRequest(
        @NotNull Long employeeId,
        @NotNull LeaveType leaveType,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank String reason) {}
