package nexusHR.leave.service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.enums.LeaveStatus;
import nexusHR.common.enums.LeaveType;
import nexusHR.leave.dto.LeaveBalanceResponse;
import nexusHR.leave.entity.LeaveBalance;
import nexusHR.leave.exception.ApiException;
import nexusHR.leave.repository.LeaveBalanceRepository;
import nexusHR.leave.repository.LeaveRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaveBalanceService {
    private static final int ANNUAL_ENTITLEMENT = 20;
    private static final int SICK_ENTITLEMENT = 10;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @Transactional
    public void seedBalancesForEmployee(Long employeeId) {
        int year = LocalDate.now().getYear();
        upsertBalance(employeeId, LeaveType.ANNUAL, year, ANNUAL_ENTITLEMENT);
        upsertBalance(employeeId, LeaveType.SICK, year, SICK_ENTITLEMENT);
    }
    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getBalances(Long employeeId) {
        int year = LocalDate.now().getYear();
        return leaveBalanceRepository.findByEmployeeIdAndBalanceYear(employeeId, year).stream()
                .map(this::toResponse)
                .toList();
    }
    @Transactional(readOnly = true)
    public int countUnpaidLeaveDays(Long employeeId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return leaveRequestRepository.findByEmployeeIdOrderBySubmittedAtDesc(employeeId).stream()
                .filter(leave -> leave.getStatus() == LeaveStatus.APPROVED)
                .filter(leave -> leave.getLeaveType() == LeaveType.UNPAID)
                .mapToInt(leave -> overlapDays(leave.getStartDate(), leave.getEndDate(), start, end))
                .sum();
    }
    @Transactional
    public void validateAndReserve(LeaveType leaveType, Long employeeId, LocalDate startDate, LocalDate endDate) {
        if (leaveType == LeaveType.UNPAID) {
            return;
        }
        int requestedDays = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndBalanceYear(employeeId, leaveType, startDate.getYear())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST, "No leave balance configured for " + leaveType));
        if (balance.getRemainingDays() < requestedDays) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient "
                            + leaveType
                            + " balance. Requested "
                            + requestedDays
                            + ", remaining "
                            + balance.getRemainingDays());
        }
    }
    @Transactional
    public void consumeApprovedLeave(LeaveType leaveType, Long employeeId, LocalDate startDate, LocalDate endDate) {
        if (leaveType == LeaveType.UNPAID) {
            return;
        }
        int days = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndBalanceYear(employeeId, leaveType, startDate.getYear())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Leave balance not found"));
        balance.setUsedDays(balance.getUsedDays() + days);
        balance.setRemainingDays(balance.getEntitledDays() - balance.getUsedDays());
        leaveBalanceRepository.save(balance);
    }

    private void upsertBalance(Long employeeId, LeaveType leaveType, int year, int entitledDays) {
        if (leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndBalanceYear(employeeId, leaveType, year)
                .isPresent()) {
            return;
        }
        LeaveBalance balance = new LeaveBalance();
        balance.setEmployeeId(employeeId);
        balance.setLeaveType(leaveType);
        balance.setBalanceYear(year);
        balance.setEntitledDays(entitledDays);
        balance.setUsedDays(0);
        balance.setRemainingDays(entitledDays);
        leaveBalanceRepository.save(balance);
    }
    private LeaveBalanceResponse toResponse(LeaveBalance balance) {
        return new LeaveBalanceResponse(
                balance.getLeaveType(),
                balance.getBalanceYear(),
                balance.getEntitledDays(),
                balance.getUsedDays(),
                balance.getRemainingDays());
    }
    private static int overlapDays(LocalDate start, LocalDate end, LocalDate rangeStart, LocalDate rangeEnd) {
        LocalDate overlapStart = start.isBefore(rangeStart) ? rangeStart : start;
        LocalDate overlapEnd = end.isAfter(rangeEnd) ? rangeEnd : end;
        if (overlapEnd.isBefore(overlapStart)) {
            return 0;
        }
        return (int) ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
    }
}
