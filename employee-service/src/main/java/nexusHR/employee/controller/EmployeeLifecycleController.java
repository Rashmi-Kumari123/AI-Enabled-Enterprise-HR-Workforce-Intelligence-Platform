package nexusHR.employee.controller;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.employee.dto.EmployeeOnboardingPipelineResponse;
import nexusHR.employee.dto.EmployeeResponse;
import nexusHR.employee.dto.InternalOnboardRequest;
import nexusHR.employee.dto.OffboardRequest;
import nexusHR.employee.dto.OnboardingStatusResponse;
import nexusHR.employee.exception.ApiException;
import nexusHR.employee.service.EmployeeLifecycleService;
import nexusHR.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeLifecycleController {
    private final EmployeeLifecycleService employeeLifecycleService;
    private final EmployeeService employeeService;

    @Value("${app.employee.internal-key:nexushr-internal-dev-key}")
    private String internalKey;

    @PostMapping("/internal/onboard")
    public EmployeeResponse internalOnboard(
            @RequestHeader("X-Internal-Key") String key, @Valid @RequestBody InternalOnboardRequest request) {
        validateInternalKey(key);
        return employeeLifecycleService.onboard(request);
    }
    @PostMapping("/internal/provision")
    public EmployeeResponse internalProvision(
            @RequestHeader("X-Internal-Key") String key, @Valid @RequestBody InternalOnboardRequest request) {
        validateInternalKey(key);
        return employeeLifecycleService.provisionIfMissing(request);
    }
    @GetMapping("/internal/by-user/{userId}")
    public EmployeeResponse internalFindByUser(
            @RequestHeader("X-Internal-Key") String key, @PathVariable Long userId) {
        validateInternalKey(key);
        return employeeLifecycleService.findByUserId(userId);
    }
    @GetMapping("/internal/{employeeId}")
    public EmployeeResponse internalFindById(
            @RequestHeader("X-Internal-Key") String key, @PathVariable Long employeeId) {
        validateInternalKey(key);
        return employeeService.findById(employeeId);
    }

    @GetMapping("/internal/active")
    public List<EmployeeResponse> internalListActive(@RequestHeader("X-Internal-Key") String key) {
        validateInternalKey(key);
        return employeeService.findAll().stream()
                .filter(employee -> employee.employmentStatus() != nexusHR.common.enums.EmploymentStatus.TERMINATED)
                .toList();
    }
    @GetMapping("/onboarding/pipeline")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public List<EmployeeOnboardingPipelineResponse> onboardingPipeline() {
        return employeeLifecycleService.getOnboardingPipeline();
    }

    @GetMapping("/{id}/onboarding")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER', 'EMPLOYEE')")
    public OnboardingStatusResponse onboardingStatus(@PathVariable Long id) {
        return employeeLifecycleService.getOnboardingStatus(id);
    }
    @PostMapping("/{id}/onboarding/tasks/{taskId}/complete")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public OnboardingStatusResponse completeTask(@PathVariable Long id, @PathVariable Long taskId) {
        return employeeLifecycleService.completeTask(id, taskId);
    }
    @PostMapping("/{id}/offboard")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public EmployeeResponse offboard(@PathVariable Long id, @RequestBody(required = false) OffboardRequest request) {
        return employeeLifecycleService.offboard(id, request != null ? request : new OffboardRequest("Offboarded"));
    }
    private void validateInternalKey(String key) {
        if (!internalKey.equals(key)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid internal key");
        }
    }
}
