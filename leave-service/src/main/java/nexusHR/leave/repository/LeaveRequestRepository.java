package nexusHR.leave.repository;

import java.util.List;
import java.util.Optional;
import nexusHR.common.enums.LeaveStatus;
import nexusHR.leave.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByTenantIdAndEmployeeIdOrderBySubmittedAtDesc(Long tenantId, Long employeeId);

    List<LeaveRequest> findByTenantIdAndStatusOrderBySubmittedAtAsc(Long tenantId, LeaveStatus status);

    Optional<LeaveRequest> findByIdAndTenantId(Long id, Long tenantId);
}
