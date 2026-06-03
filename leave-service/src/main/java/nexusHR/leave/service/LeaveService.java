package nexusHR.leave.service;

import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.enums.LeaveStatus;
import nexusHR.leave.dto.LeaveResponse;
import nexusHR.leave.dto.LeaveReviewRequest;
import nexusHR.leave.dto.LeaveSubmitRequest;
import nexusHR.leave.entity.LeaveRequest;
import nexusHR.leave.exception.ApiException;
import nexusHR.leave.repository.LeaveRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;

    @Transactional
    public LeaveResponse submit(LeaveSubmitRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "endDate must be on or after startDate");
        }

        LeaveRequest leave = new LeaveRequest();
        leave.setEmployeeId(request.employeeId());
        leave.setLeaveType(request.leaveType());
        leave.setStartDate(request.startDate());
        leave.setEndDate(request.endDate());
        leave.setReason(request.reason());
        leave.setStatus(LeaveStatus.PENDING);
        leave.setSubmittedAt(Instant.now());
        return LeaveResponse.from(leaveRequestRepository.save(leave));
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
        return review(id, reviewerEmail, review, LeaveStatus.APPROVED);
    }

    @Transactional
    public LeaveResponse reject(Long id, String reviewerEmail, LeaveReviewRequest review) {
        return review(id, reviewerEmail, review, LeaveStatus.REJECTED);
    }

    @Transactional
    public LeaveResponse cancel(Long id) {
        LeaveRequest leave = getPendingLeave(id);
        leave.setStatus(LeaveStatus.CANCELLED);
        leave.setReviewedAt(Instant.now());
        return LeaveResponse.from(leaveRequestRepository.save(leave));
    }

    private LeaveResponse review(
            Long id, String reviewerEmail, LeaveReviewRequest review, LeaveStatus targetStatus) {
        LeaveRequest leave = getPendingLeave(id);
        leave.setStatus(targetStatus);
        leave.setReviewedBy(reviewerEmail);
        leave.setReviewComment(review != null ? review.comment() : null);
        leave.setReviewedAt(Instant.now());
        return LeaveResponse.from(leaveRequestRepository.save(leave));
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
