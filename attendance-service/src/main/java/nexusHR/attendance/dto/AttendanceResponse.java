package nexusHR.attendance.dto;

import java.time.Instant;
import java.time.LocalDate;
import nexusHR.attendance.entity.AttendanceRecord;
import nexusHR.common.enums.AttendanceStatus;

public record AttendanceResponse(
        Long id,
        Long employeeId,
        LocalDate workDate,
        Instant clockIn,
        Instant clockOut,
        AttendanceStatus status,
        String notes) {

    public static AttendanceResponse from(AttendanceRecord record) {
        return new AttendanceResponse(
                record.getId(),
                record.getEmployeeId(),
                record.getWorkDate(),
                record.getClockIn(),
                record.getClockOut(),
                record.getStatus(),
                record.getNotes());
    }
}
