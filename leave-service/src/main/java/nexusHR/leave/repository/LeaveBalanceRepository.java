package nexusHR.leave.repository;
import java.util.List;
import java.util.Optional;
import nexusHR.common.enums.LeaveType;
import nexusHR.leave.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    List<LeaveBalance> findByEmployeeIdAndBalanceYear(Long employeeId, int balanceYear);
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeAndBalanceYear(
            Long employeeId, LeaveType leaveType, int balanceYear);
}
