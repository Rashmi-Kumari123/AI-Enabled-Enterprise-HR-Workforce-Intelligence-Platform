package nexusHR.leave.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.leave.dto.LeaveResponse;
import nexusHR.leave.dto.LeaveReviewRequest;
import nexusHR.leave.dto.LeaveSubmitRequest;
import nexusHR.leave.service.LeaveService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "leave-service");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public LeaveResponse submit(@Valid @RequestBody LeaveSubmitRequest request) {
        return leaveService.submit(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public LeaveResponse getById(@PathVariable Long id) {
        return leaveService.findById(id);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public List<LeaveResponse> listByEmployee(@PathVariable Long employeeId) {
        return leaveService.findByEmployee(employeeId);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public List<LeaveResponse> listPending() {
        return leaveService.findPending();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public LeaveResponse approve(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody(required = false) LeaveReviewRequest review) {
        return leaveService.approve(id, authentication.getName(), review);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public LeaveResponse reject(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody(required = false) LeaveReviewRequest review) {
        return leaveService.reject(id, authentication.getName(), review);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public LeaveResponse cancel(@PathVariable Long id) {
        return leaveService.cancel(id);
    }
}
