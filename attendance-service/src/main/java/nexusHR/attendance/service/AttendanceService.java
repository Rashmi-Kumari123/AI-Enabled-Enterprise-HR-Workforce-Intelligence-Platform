package nexusHR.attendance.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.attendance.dto.AttendanceRequest;
import nexusHR.attendance.dto.AttendanceResponse;
import nexusHR.attendance.dto.NotificationDispatchPayload;
import nexusHR.attendance.entity.AttendanceRecord;
import nexusHR.attendance.exception.ApiException;
import nexusHR.attendance.integration.EmployeeServiceClient;
import nexusHR.attendance.integration.NotificationClient;
import nexusHR.attendance.repository.AttendanceRecordRepository;
import nexusHR.common.enums.AttendanceStatus;
import nexusHR.common.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final NotificationClient notificationClient;
    private final EmployeeServiceClient employeeServiceClient;

    @Transactional
    public AttendanceResponse clockIn(AttendanceRequest request) {
        Long tenantId = TenantContext.requireTenantId();
        LocalDate today = LocalDate.now();
        attendanceRecordRepository
                .findByTenantIdAndEmployeeIdAndWorkDateAndStatus(
                        tenantId, request.employeeId(), today, AttendanceStatus.CLOCKED_IN)
                .ifPresent(record -> {
                    throw new ApiException(HttpStatus.CONFLICT, "Employee is already clocked in for today");
                });

        AttendanceRecord record = new AttendanceRecord();
        record.setTenantId(tenantId);
        record.setEmployeeId(request.employeeId());
        record.setWorkDate(today);
        record.setClockIn(Instant.now());
        record.setStatus(AttendanceStatus.CLOCKED_IN);
        record.setNotes(request.notes());
        AttendanceRecord saved = attendanceRecordRepository.save(record);
        notifyClockEvent(saved, "ATTENDANCE_CLOCK_IN", "Checked in", "You clocked in at ");
        return AttendanceResponse.from(saved);
    }

    @Transactional
    public AttendanceResponse clockOut(AttendanceRequest request) {
        Long tenantId = TenantContext.requireTenantId();
        LocalDate today = LocalDate.now();
        AttendanceRecord record = attendanceRecordRepository
                .findByTenantIdAndEmployeeIdAndWorkDateAndStatus(
                        tenantId, request.employeeId(), today, AttendanceStatus.CLOCKED_IN)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No active clock-in found for today"));

        record.setClockOut(Instant.now());
        record.setStatus(AttendanceStatus.CLOCKED_OUT);
        if (request.notes() != null && !request.notes().isBlank()) {
            record.setNotes(request.notes());
        }
        AttendanceRecord saved = attendanceRecordRepository.save(record);
        notifyClockEvent(saved, "ATTENDANCE_CLOCK_OUT", "Checked out", "You clocked out at ");
        return AttendanceResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> findByEmployee(Long employeeId) {
        return attendanceRecordRepository
                .findByTenantIdAndEmployeeIdOrderByWorkDateDesc(TenantContext.requireTenantId(), employeeId)
                .stream()
                .map(AttendanceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceResponse findToday(Long employeeId) {
        return attendanceRecordRepository
                .findByTenantIdAndEmployeeIdAndWorkDate(
                        TenantContext.requireTenantId(), employeeId, LocalDate.now())
                .map(AttendanceResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No attendance record for today"));
    }
    private void notifyClockEvent(
            AttendanceRecord record, String type, String title, String messagePrefix) {
        var employee = employeeServiceClient.fetchEmployee(record.getEmployeeId());
        if (employee == null || employee.email() == null) {
            return;
        }
        Instant eventTime = "ATTENDANCE_CLOCK_IN".equals(type) ? record.getClockIn() : record.getClockOut();
        String timeLabel = eventTime == null ? "now" : TIME_FORMAT.format(eventTime.atZone(java.time.ZoneId.systemDefault()));
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                employee.email(),
                title,
                messagePrefix + timeLabel + " on " + record.getWorkDate() + ".",
                type,
                "ATTENDANCE",
                record.getId()));
    }
}
