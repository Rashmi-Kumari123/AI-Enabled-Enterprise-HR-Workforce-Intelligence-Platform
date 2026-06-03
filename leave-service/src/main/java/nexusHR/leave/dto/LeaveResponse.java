package nexusHR.leave.dto;

import java.time.Instant;
import java.time.LocalDate;
import nexusHR.common.enums.LeaveStatus;
import nexusHR.common.enums.LeaveType;
import nexusHR.leave.entity.LeaveRequest;

public record LeaveResponse(
        Long id,
        Long employeeId,
        LeaveType leaveType,
        LocalDate startDate,
        LocalDate endDate,
        String reason,
        LeaveStatus status,
        String reviewedBy,
        String reviewComment,
        Instant submittedAt,
        Instant reviewedAt) {

    public static LeaveResponse from(LeaveRequest request) {
        return new LeaveResponse(
                request.getId(),
                request.getEmployeeId(),
                request.getLeaveType(),
                request.getStartDate(),
                request.getEndDate(),
                request.getReason(),
                request.getStatus(),
                request.getReviewedBy(),
                request.getReviewComment(),
                request.getSubmittedAt(),
                request.getReviewedAt());
    }
}
