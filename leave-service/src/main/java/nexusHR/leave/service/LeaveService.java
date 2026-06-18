package nexusHR.leave.service;

import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.enums.LeaveStatus;
import nexusHR.leave.dto.LeaveBalanceResponse;
import nexusHR.leave.dto.LeaveResponse;
import nexusHR.leave.dto.LeaveReviewRequest;
import nexusHR.leave.dto.LeaveSubmitRequest;
import nexusHR.leave.dto.NotificationDispatchPayload;
import nexusHR.leave.entity.LeaveRequest;
import nexusHR.leave.exception.ApiException;
import nexusHR.leave.integration.EmployeeServiceClient;
import nexusHR.leave.integration.NotificationClient;
import nexusHR.leave.repository.LeaveRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final NotificationClient notificationClient;
    private final EmployeeServiceClient employeeServiceClient;

    @Transactional
    public List<LeaveBalanceResponse> getBalances(Long employeeId) {
        return leaveBalanceService.getBalances(employeeId);
    }

    @Transactional
    public LeaveResponse submit(LeaveSubmitRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "endDate must be on or after startDate");
        }
        leaveBalanceService.validateAndReserve(
                request.leaveType(), request.employeeId(), request.startDate(), request.endDate());

        LeaveRequest leave = new LeaveRequest();
        leave.setEmployeeId(request.employeeId());
        leave.setLeaveType(request.leaveType());
        leave.setStartDate(request.startDate());
        leave.setEndDate(request.endDate());
        leave.setReason(request.reason());
        leave.setStatus(LeaveStatus.PENDING);
        leave.setSubmittedAt(Instant.now());
        LeaveRequest saved = leaveRequestRepository.save(leave);
        notifyLeaveSubmitted(saved);
        return LeaveResponse.from(saved);
    }
    @Transactional(readOnly = true)
    public LeaveResponse findById(Long id) {
        return leaveRequestRepository
                .findById(id)
                .map(LeaveResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Leave request not found"));
    }
    @Transactional(readOnly = true)
    public List<LeaveResponse> findByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderBySubmittedAtDesc(employeeId).stream()
                .map(LeaveResponse::from)
                .toList();
    }
    @Transactional(readOnly = true)
    public List<LeaveResponse> findPending() {
        return leaveRequestRepository.findByStatusOrderBySubmittedAtAsc(LeaveStatus.PENDING).stream()
                .map(LeaveResponse::from)
                .toList();
    }
    @Transactional
    public LeaveResponse approve(Long id, String reviewerEmail, LeaveReviewRequest review) {
        LeaveRequest leave = getPendingLeave(id);
        leave.setStatus(LeaveStatus.APPROVED);
        leave.setReviewedBy(reviewerEmail);
        leave.setReviewComment(review != null ? review.comment() : null);
        leave.setReviewedAt(Instant.now());
        LeaveRequest saved = leaveRequestRepository.save(leave);
        leaveBalanceService.consumeApprovedLeave(
                saved.getLeaveType(), saved.getEmployeeId(), saved.getStartDate(), saved.getEndDate());
        notifyLeaveReviewed(saved, LeaveStatus.APPROVED);
        return LeaveResponse.from(saved);
    }
    @Transactional
    public LeaveResponse reject(Long id, String reviewerEmail, LeaveReviewRequest review) {
        LeaveRequest leave = getPendingLeave(id);
        leave.setStatus(LeaveStatus.REJECTED);
        leave.setReviewedBy(reviewerEmail);
        leave.setReviewComment(review != null ? review.comment() : null);
        leave.setReviewedAt(Instant.now());
        LeaveRequest saved = leaveRequestRepository.save(leave);
        notifyLeaveReviewed(saved, LeaveStatus.REJECTED);
        return LeaveResponse.from(saved);
    }
    @Transactional
    public LeaveResponse cancel(Long id) {
        LeaveRequest leave = getPendingLeave(id);
        leave.setStatus(LeaveStatus.CANCELLED);
        leave.setReviewedAt(Instant.now());
        LeaveRequest saved = leaveRequestRepository.save(leave);
        notifyLeaveCancelled(saved);
        return LeaveResponse.from(saved);
    }
    private void notifyLeaveSubmitted(LeaveRequest leave) {
        var employee = employeeServiceClient.fetchEmployee(leave.getEmployeeId());
        String employeeLabel =
                employee != null ? employee.fullName() : "Employee #" + leave.getEmployeeId();
        String period = leave.getStartDate() + " → " + leave.getEndDate();

        notificationClient.dispatch(new NotificationDispatchPayload(
                "MANAGERS",
                null,
                "New leave request",
                employeeLabel
                        + " submitted "
                        + leave.getLeaveType()
                        + " leave ("
                        + period
                        + "). Please review in Leave approvals.",
                "LEAVE_SUBMITTED",
                "LEAVE",
                leave.getId()));

        if (employee != null && employee.email() != null) {
            notificationClient.dispatch(new NotificationDispatchPayload(
                    "USER",
                    employee.email(),
                    "Leave request submitted",
                    "Your "
                            + leave.getLeaveType()
                            + " leave ("
                            + period
                            + ") is pending manager approval.",
                    "LEAVE_SUBMITTED",
                    "LEAVE",
                    leave.getId()));
        }
    }
    private void notifyLeaveReviewed(LeaveRequest leave, LeaveStatus status) {
        var employee = employeeServiceClient.fetchEmployee(leave.getEmployeeId());
        if (employee == null || employee.email() == null) {
            return;
        }
        String period = leave.getStartDate() + " → " + leave.getEndDate();
        boolean approved = status == LeaveStatus.APPROVED;
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                employee.email(),
                approved ? "Leave approved" : "Leave rejected",
                (approved ? "Approved" : "Rejected")
                        + ": your "
                        + leave.getLeaveType()
                        + " leave ("
                        + period
                        + ")"
                        + (leave.getReviewComment() != null ? ". Comment: " + leave.getReviewComment() : "."),
                approved ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
                "LEAVE",
                leave.getId()));
    }
    private void notifyLeaveCancelled(LeaveRequest leave) {
        var employee = employeeServiceClient.fetchEmployee(leave.getEmployeeId());
        if (employee == null || employee.email() == null) {
            return;
        }
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                employee.email(),
                "Leave request cancelled",
                "Your "
                        + leave.getLeaveType()
                        + " leave ("
                        + leave.getStartDate()
                        + " → "
                        + leave.getEndDate()
                        + ") was cancelled.",
                "LEAVE_CANCELLED",
                "LEAVE",
                leave.getId()));
    }

    private LeaveRequest getPendingLeave(Long id) {
        LeaveRequest leave = leaveRequestRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Leave request not found"));
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ApiException(
                    HttpStatus.CONFLICT, "Only pending leave requests can be updated (current: " + leave.getStatus() + ")");
        }
        return leave;
    }
}
