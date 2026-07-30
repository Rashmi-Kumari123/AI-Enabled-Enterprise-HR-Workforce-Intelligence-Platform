package nexusHR.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import nexusHR.attendance.entity.AttendanceRecord;
import nexusHR.common.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    Optional<AttendanceRecord> findByTenantIdAndEmployeeIdAndWorkDate(
            Long tenantId, Long employeeId, LocalDate workDate);

    Optional<AttendanceRecord> findByTenantIdAndEmployeeIdAndWorkDateAndStatus(
            Long tenantId, Long employeeId, LocalDate workDate, AttendanceStatus status);

    List<AttendanceRecord> findByTenantIdAndEmployeeIdOrderByWorkDateDesc(Long tenantId, Long employeeId);
}
