package nexusHR.employee.config;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.common.enums.EmploymentStatus;
import nexusHR.common.util.EmailRoleHeuristic;
import nexusHR.employee.entity.Employee;
import nexusHR.employee.integration.AuthServiceClient;
import nexusHR.employee.repository.EmployeeRepository;
import nexusHR.employee.repository.OnboardingTaskRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
@Slf4j
@Component
@Order(5)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.lifecycle.repair-platform-staff", havingValue = "true", matchIfMissing = true)
public class PlatformStaffOnboardingRepair implements ApplicationRunner {
    private final EmployeeRepository employeeRepository;
    private final OnboardingTaskRepository onboardingTaskRepository;
    private final AuthServiceClient authServiceClient;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        employeeRepository.findByOnboardingCompletedFalseOrderByCreatedAtDesc().stream()
                .filter(this::isPlatformOperator)
                .forEach(this::activatePlatformStaff);
    }
    private boolean isPlatformOperator(Employee employee) {
        if (employee.getUserId() != null
                && authServiceClient.isPlatformOperator(employee.getUserId(), employee.getEmail())) {
            return true;
        }
        return EmailRoleHeuristic.isPlatformOperatorEmail(employee.getEmail());
    }
    private void activatePlatformStaff(Employee employee) {
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setOnboardingCompleted(true);
        employeeRepository.save(employee);

        onboardingTaskRepository.findByEmployeeIdOrderByCreatedAtAsc(employee.getId()).stream()
                .filter(task -> !task.isCompleted())
                .forEach(task -> {
                    task.setCompleted(true);
                    task.setCompletedAt(Instant.now());
                    onboardingTaskRepository.save(task);
                });
        log.info(
                "Skipped onboarding for platform operator {} ({})",
                employee.getEmail(),
                employee.getEmployeeCode());
    }
}
