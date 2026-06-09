package nexusHR.employee.service;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.enums.EmploymentStatus;
import nexusHR.employee.dto.EmployeeResponse;
import nexusHR.employee.dto.InternalOnboardRequest;
import nexusHR.employee.dto.OffboardRequest;
import nexusHR.employee.dto.OnboardingStatusResponse;
import nexusHR.employee.dto.OnboardingTaskResponse;
import nexusHR.employee.entity.Department;
import nexusHR.employee.entity.Employee;
import nexusHR.employee.entity.OnboardingTask;
import nexusHR.employee.exception.ApiException;
import nexusHR.employee.integration.AuthServiceClient;
import nexusHR.employee.integration.LeaveServiceClient;
import nexusHR.employee.repository.DepartmentRepository;
import nexusHR.employee.repository.EmployeeRepository;
import nexusHR.employee.repository.OnboardingTaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeLifecycleService {
    private static final List<String[]> DEFAULT_ONBOARDING_TASKS = List.of(
            new String[] {"DOCUMENTS", "Submit identity and tax documents"},
            new String[] {"IT_ACCESS", "Provision email, laptop, and system access"},
            new String[] {"HR_ORIENTATION", "Complete HR orientation session"},
            new String[] {"POLICY_ACK", "Acknowledge company policies"});

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final OnboardingTaskRepository onboardingTaskRepository;
    private final AuthServiceClient authServiceClient;
    private final LeaveServiceClient leaveServiceClient;
    private final EmployeeService employeeService;

    @Transactional
    public EmployeeResponse onboard(InternalOnboardRequest request) {
        employeeRepository.findByUserId(request.userId()).ifPresent(existing -> {
            throw new ApiException(HttpStatus.CONFLICT, "User already linked to employee " + existing.getId());
        });
        Employee employee = new Employee();
        employee.setUserId(request.userId());
        employee.setEmployeeCode(generateEmployeeCode(request.userId()));
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName().trim());
        employee.setEmail(request.email().toLowerCase().trim());
        employee.setPhone(request.phone());
        employee.setDepartment(resolveDepartment(request.departmentId()));
        employee.setHireDate(LocalDate.now());
        employee.setEmploymentStatus(EmploymentStatus.PROBATION);
        employee.setOnboardingCompleted(false);
        Employee saved = employeeRepository.save(employee);

        for (String[] task : DEFAULT_ONBOARDING_TASKS) {
            OnboardingTask onboardingTask = new OnboardingTask();
            onboardingTask.setEmployeeId(saved.getId());
            onboardingTask.setTaskCode(task[0]);
            onboardingTask.setTitle(task[1]);
            onboardingTask.setCompleted(false);
            onboardingTaskRepository.save(onboardingTask);
        }
        leaveServiceClient.seedBalances(saved.getId());
        return employeeService.findById(saved.getId());
    }
    @Transactional(readOnly = true)
    public OnboardingStatusResponse getOnboardingStatus(Long employeeId) {
        Employee employee = getEmployee(employeeId);
        List<OnboardingTaskResponse> tasks = onboardingTaskRepository.findByEmployeeIdOrderByCreatedAtAsc(employeeId).stream()
                .map(task -> new OnboardingTaskResponse(
                        task.getId(), task.getTaskCode(), task.getTitle(), task.isCompleted(), task.getCompletedAt()))
                .toList();
        return new OnboardingStatusResponse(employee.getId(), employee.isOnboardingCompleted(), tasks);
    }
    @Transactional
    public OnboardingStatusResponse completeTask(Long employeeId, Long taskId) {
        OnboardingTask task = onboardingTaskRepository
                .findById(taskId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Onboarding task not found"));
        if (!task.getEmployeeId().equals(employeeId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Onboarding task not found");
        }
        task.setCompleted(true);
        task.setCompletedAt(Instant.now());
        onboardingTaskRepository.save(task);
        maybeCompleteOnboarding(employeeId);
        return getOnboardingStatus(employeeId);
    }
    @Transactional
    public EmployeeResponse offboard(Long employeeId, OffboardRequest request) {
        Employee employee = getEmployee(employeeId);
        if (employee.getEmploymentStatus() == EmploymentStatus.TERMINATED) {
            throw new ApiException(HttpStatus.CONFLICT, "Employee is already offboarded");
        }
        employee.setEmploymentStatus(EmploymentStatus.TERMINATED);
        employee.setTerminationDate(LocalDate.now());
        employeeRepository.save(employee);
        authServiceClient.disableUser(employee.getUserId());
        return employeeService.findById(employeeId);
    }
    @Transactional(readOnly = true)
    public EmployeeResponse findByUserId(Long userId) {
        return employeeRepository
                .findByUserId(userId)
                .map(employee -> employeeService.findById(employee.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found for user"));
    }
    private void maybeCompleteOnboarding(Long employeeId) {
        if (onboardingTaskRepository.countByEmployeeIdAndCompletedFalse(employeeId) > 0) {
            return;
        }
        Employee employee = getEmployee(employeeId);
        employee.setOnboardingCompleted(true);
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employeeRepository.save(employee);
    }
    private Employee getEmployee(Long employeeId) {
        return employeeRepository
                .findById(employeeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));
    }
    private Department resolveDepartment(Long departmentId) {
        if (departmentId == null) {
            return null;
        }
        return departmentRepository
                .findById(departmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Department not found"));
    }
    private static String generateEmployeeCode(Long userId) {
        return "EMP-" + String.format("%05d", userId);
    }
}
