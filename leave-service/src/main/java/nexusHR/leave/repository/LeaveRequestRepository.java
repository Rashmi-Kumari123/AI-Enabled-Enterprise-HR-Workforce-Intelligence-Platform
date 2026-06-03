package nexusHR.leave.repository;

import java.util.List;
import nexusHR.common.enums.LeaveStatus;
import nexusHR.leave.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderBySubmittedAtDesc(Long employeeId);

    List<LeaveRequest> findByStatusOrderBySubmittedAtAsc(LeaveStatus status);
}
