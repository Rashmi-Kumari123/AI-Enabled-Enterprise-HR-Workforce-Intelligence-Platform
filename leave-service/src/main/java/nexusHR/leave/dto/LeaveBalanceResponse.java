package nexusHR.leave.dto;
import nexusHR.common.enums.LeaveType;
public record LeaveBalanceResponse(
        LeaveType leaveType, int balanceYear, int entitledDays, int usedDays, int remainingDays) {}
