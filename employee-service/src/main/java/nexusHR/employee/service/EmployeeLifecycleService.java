package nexusHR.employee.service;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.enums.EmploymentStatus;
import nexusHR.employee.dto.EmployeeOnboardingPipelineResponse;
import nexusHR.employee.dto.EmployeeResponse;
import nexusHR.employee.dto.InternalOnboardRequest;
import nexusHR.employee.dto.NotificationDispatchPayload;
import nexusHR.employee.dto.OffboardRequest;
import nexusHR.employee.dto.OnboardingStatusResponse;
import nexusHR.employee.dto.OnboardingTaskResponse;
import nexusHR.employee.entity.Department;
import nexusHR.employee.entity.Employee;
import nexusHR.employee.entity.OnboardingTask;
import nexusHR.employee.exception.ApiException;
import nexusHR.employee.integration.AuthServiceClient;
import nexusHR.employee.integration.LeaveServiceClient;
import nexusHR.employee.integration.NotificationClient;
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
    private final NotificationClient notificationClient;

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
        employee.setDepartment(resolveDepartment(request.departmentId(), request.departmentCode()));
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
        sendOnboardingWelcome(saved);
        return employeeService.findById(saved.getId());
    }
    @Transactional(readOnly = true)
    public List<EmployeeOnboardingPipelineResponse> getOnboardingPipeline() {
        return employeeRepository.findByOnboardingCompletedFalseOrderByCreatedAtDesc().stream()
                .map(this::toPipelineResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OnboardingStatusResponse getOnboardingStatus(Long employeeId) {
        Employee employee = getEmployee(employeeId);
        return new OnboardingStatusResponse(employee.getId(), employee.isOnboardingCompleted(), mapTasks(employeeId));
    }
    @Transactional
    public OnboardingStatusResponse completeTask(Long employeeId, Long taskId) {
        OnboardingTask task = onboardingTaskRepository
                .findById(taskId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Onboarding task not found"));
        if (!task.getEmployeeId().equals(employeeId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Onboarding task not found");
        }
        if (!task.isCompleted()) {
            task.setCompleted(true);
            task.setCompletedAt(Instant.now());
            onboardingTaskRepository.save(task);
            Employee employee = getEmployee(employeeId);
            notificationClient.dispatch(new NotificationDispatchPayload(
                    "USER",
                    employee.getEmail(),
                    "Onboarding task completed",
                    task.getTitle() + " has been marked complete by HR.",
                    "ONBOARDING_TASK_PENDING",
                    "ONBOARDING_TASK",
                    task.getId()));
        }
        boolean completed = maybeCompleteOnboarding(employeeId);
        if (completed) {
            Employee employee = getEmployee(employeeId);
            notificationClient.dispatch(new NotificationDispatchPayload(
                    "USER",
                    employee.getEmail(),
                    "Onboarding complete",
                    "Welcome aboard! Your employment status is now ACTIVE.",
                    "ONBOARDING_COMPLETED",
                    "ONBOARDING",
                    employee.getId()));
        }
        return getOnboardingStatus(employeeId);
    }

    @Transactional
    public EmployeeResponse offboard(Long employeeId, OffboardRequest request) {
        Employee employee = getEmployee(employeeId);
        if (employee.getEmploymentStatus() == EmploymentStatus.TERMINATED) {
            throw new ApiException(HttpStatus.CONFLICT, "Employee is already offboarded");
        }
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                employee.getEmail(),
                "Employment ended",
                "Your NexusHR account has been offboarded. Contact HR if you have questions.",
                "SYSTEM",
                "OFFBOARDING",
                employee.getId()));
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

    private boolean maybeCompleteOnboarding(Long employeeId) {
        if (onboardingTaskRepository.countByEmployeeIdAndCompletedFalse(employeeId) > 0) {
            return false;
        }
        Employee employee = getEmployee(employeeId);
        if (employee.isOnboardingCompleted()) {
            return false;
        }
        employee.setOnboardingCompleted(true);
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employeeRepository.save(employee);
        return true;
    }

    private EmployeeOnboardingPipelineResponse toPipelineResponse(Employee employee) {
        Department department = employee.getDepartment();
        return new EmployeeOnboardingPipelineResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                department != null ? department.getName() : null,
                employee.getEmploymentStatus().name(),
                employee.isOnboardingCompleted(),
                mapTasks(employee.getId()));
    }
    private List<OnboardingTaskResponse> mapTasks(Long employeeId) {
        return onboardingTaskRepository.findByEmployeeIdOrderByCreatedAtAsc(employeeId).stream()
                .map(task -> new OnboardingTaskResponse(
                        task.getId(), task.getTaskCode(), task.getTitle(), task.isCompleted(), task.getCompletedAt()))
                .toList();
    }
    private void sendOnboardingWelcome(Employee employee) {
        String fullName = employee.getFirstName() + " " + employee.getLastName();
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                employee.getEmail(),
                "Welcome to NexusHR",
                "Hi " + employee.getFirstName() + ", your onboarding has started. Upload documents in Profile & Settings.",
                "ONBOARDING_WELCOME",
                "ONBOARDING",
                employee.getId()));
        notificationClient.dispatch(new NotificationDispatchPayload(
                "MANAGERS",
                null,
                "New hire onboarding",
                fullName + " (" + employee.getEmployeeCode() + ") requires HR onboarding checklist completion.",
                "ONBOARDING_TASK_PENDING",
                "ONBOARDING",
                employee.getId()));
    }
    private Employee getEmployee(Long employeeId) {
        return employeeRepository
                .findById(employeeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));
    }
    private Department resolveDepartment(Long departmentId, String departmentCode) {
        if (departmentId != null) {
            return departmentRepository
                    .findById(departmentId)
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Department not found"));
        }
        if (departmentCode != null && !departmentCode.isBlank()) {
            return departmentRepository
                    .findByCode(departmentCode.trim().toUpperCase())
                    .orElse(null);
        }
        return null;
    }
    private Department resolveDepartment(Long departmentId) {
        return resolveDepartment(departmentId, null);
    }
    private static String generateEmployeeCode(Long userId) {
        return "EMP-" + String.format("%05d", userId);
    }
}
