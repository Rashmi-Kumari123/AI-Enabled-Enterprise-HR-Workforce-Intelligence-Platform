package nexusHR.attendance.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.attendance.dto.AttendanceRequest;
import nexusHR.attendance.dto.AttendanceResponse;
import nexusHR.attendance.service.AttendanceService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/clock-in")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public AttendanceResponse clockIn(@Valid @RequestBody AttendanceRequest request) {
        return attendanceService.clockIn(request);
    }

    @PostMapping("/clock-out")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public AttendanceResponse clockOut(@Valid @RequestBody AttendanceRequest request) {
        return attendanceService.clockOut(request);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER', 'EMPLOYEE')")
    public List<AttendanceResponse> listByEmployee(@PathVariable Long employeeId) {
        return attendanceService.findByEmployee(employeeId);
    }

    @GetMapping("/employee/{employeeId}/today")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER', 'EMPLOYEE')")
    public AttendanceResponse today(@PathVariable Long employeeId) {
        return attendanceService.findToday(employeeId);
    }
}
