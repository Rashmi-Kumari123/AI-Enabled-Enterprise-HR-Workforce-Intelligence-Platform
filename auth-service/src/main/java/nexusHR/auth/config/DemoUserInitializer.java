package nexusHR.auth.config;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.auth.dto.InternalOnboardEmployeeRequest;
import nexusHR.auth.entity.Role;
import nexusHR.auth.entity.User;
import nexusHR.auth.integration.EmployeeServiceClient;
import nexusHR.auth.repository.RoleRepository;
import nexusHR.auth.repository.UserRepository;
import nexusHR.common.enums.RoleName;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.seed-enabled", havingValue = "true", matchIfMissing = true)
public class DemoUserInitializer implements ApplicationRunner {
    public static final String DEMO_PASSWORD = "NexusHR@2026";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeServiceClient employeeServiceClient;

    @Value("${app.demo.seed-enabled:true}")
    private boolean seedEnabled;

    private record DemoAccount(String email, RoleName role, String firstName, String lastName, String departmentCode) {}
    private static final DemoAccount[] DEMO_ACCOUNTS = {
        new DemoAccount("admin@nexushr.com", RoleName.ROLE_ADMIN, "Aarav", "Admin", "IT"),
        new DemoAccount("hr@nexushr.com", RoleName.ROLE_HR, "Priya", "Sharma", "HR"),
        new DemoAccount("manager@nexushr.com", RoleName.ROLE_MANAGER, "Rohan", "Mehta", "OPS"),
        new DemoAccount("employee@nexushr.com", RoleName.ROLE_EMPLOYEE, "Ananya", "Kumar", "IT"),
    };
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            return;
        }
        for (DemoAccount account : DEMO_ACCOUNTS) {
            seedDemoAccount(account);
        }
    }
    private void seedDemoAccount(DemoAccount account) {
        String email = account.email().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            return;
        }
        Role role = roleRepository
                .findByName(account.role())
                .orElseThrow(() -> new IllegalStateException("Role not configured: " + account.role()));

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
        user.getRoles().add(role);
        User saved = userRepository.save(user);

        employeeServiceClient.onboardEmployee(new InternalOnboardEmployeeRequest(
                saved.getId(),
                account.firstName(),
                account.lastName(),
                saved.getEmail(),
                null,
                null,
                account.departmentCode()));
        log.info("Seeded demo account {} ({})", email, account.role());
    }
}
