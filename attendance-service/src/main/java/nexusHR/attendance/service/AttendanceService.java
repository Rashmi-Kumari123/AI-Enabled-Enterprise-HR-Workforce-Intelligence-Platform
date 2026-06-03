package nexusHR.attendance.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.attendance.dto.AttendanceRequest;
import nexusHR.attendance.dto.AttendanceResponse;
import nexusHR.attendance.entity.AttendanceRecord;
import nexusHR.attendance.exception.ApiException;
import nexusHR.attendance.repository.AttendanceRecordRepository;
import nexusHR.common.enums.AttendanceStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;

    @Transactional
    public AttendanceResponse clockIn(AttendanceRequest request) {
        LocalDate today = LocalDate.now();
        attendanceRecordRepository
                .findByEmployeeIdAndWorkDateAndStatus(request.employeeId(), today, AttendanceStatus.CLOCKED_IN)
                .ifPresent(record -> {
                    throw new ApiException(HttpStatus.CONFLICT, "Employee is already clocked in for today");
                });

        AttendanceRecord record = new AttendanceRecord();
        record.setEmployeeId(request.employeeId());
        record.setWorkDate(today);
        record.setClockIn(Instant.now());
        record.setStatus(AttendanceStatus.CLOCKED_IN);
        record.setNotes(request.notes());
        return AttendanceResponse.from(attendanceRecordRepository.save(record));
    }

    @Transactional
    public AttendanceResponse clockOut(AttendanceRequest request) {
        LocalDate today = LocalDate.now();
        AttendanceRecord record = attendanceRecordRepository
                .findByEmployeeIdAndWorkDateAndStatus(request.employeeId(), today, AttendanceStatus.CLOCKED_IN)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No active clock-in found for today"));

        record.setClockOut(Instant.now());
        record.setStatus(AttendanceStatus.CLOCKED_OUT);
        if (request.notes() != null && !request.notes().isBlank()) {
            record.setNotes(request.notes());
        }
        return AttendanceResponse.from(attendanceRecordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> findByEmployee(Long employeeId) {
        return attendanceRecordRepository.findByEmployeeIdOrderByWorkDateDesc(employeeId).stream()
                .map(AttendanceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceResponse findToday(Long employeeId) {
        return attendanceRecordRepository
                .findByEmployeeIdAndWorkDate(employeeId, LocalDate.now())
                .map(AttendanceResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No attendance record for today"));
    }
}
