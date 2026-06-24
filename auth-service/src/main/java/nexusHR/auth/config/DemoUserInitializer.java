package nexusHR.auth.config;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.auth.dto.InternalOnboardEmployeeRequest;
import nexusHR.auth.entity.Organization;
import nexusHR.auth.entity.Role;
import nexusHR.auth.entity.User;
import nexusHR.auth.integration.EmployeeServiceClient;
import nexusHR.auth.repository.OrganizationRepository;
import nexusHR.auth.repository.RoleRepository;
import nexusHR.auth.repository.UserRepository;
import nexusHR.common.enums.RoleName;
import nexusHR.common.tenant.TenantContext;
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
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeServiceClient employeeServiceClient;

    @Value("${app.demo.seed-enabled:true}")
    private boolean seedEnabled;
    public record DemoAccount(String email, RoleName role, String firstName, String lastName, String departmentCode) {}
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
        Organization tenant = organizationRepository
                .findBySlugIgnoreCase("nexushr")
                .orElseThrow(() -> new IllegalStateException("Default nexushr tenant missing"));
        TenantContext.setTenantId(tenant.getId());
        employeeServiceClient.seedTenantDepartments(tenant.getId(), tenant.getSlug());

        for (DemoAccount account : DEMO_ACCOUNTS) {
            seedDemoAccount(tenant, account);
        }
    }
    private void seedDemoAccount(Organization tenant, DemoAccount account) {
        String email = account.email().toLowerCase().trim();
        Role role = roleRepository
                .findByName(account.role())
                .orElseThrow(() -> new IllegalStateException("Role not configured: " + account.role()));

        User user = userRepository
                .findByTenantIdAndEmail(tenant.getId(), email)
                .orElseGet(() -> {
                    User created = new User();
                    created.setTenant(tenant);
                    created.setEmail(email);
                    created.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
                    created.getRoles().add(role);
                    User saved = userRepository.save(created);
                    tenant.setSeatCount(tenant.getSeatCount() + 1);
                    log.info("Seeded demo account {} ({})", email, account.role());
                    return saved;
                });

        employeeServiceClient.provisionEmployee(new InternalOnboardEmployeeRequest(
                tenant.getId(),
                user.getId(),
                account.firstName(),
                account.lastName(),
                user.getEmail(),
                null,
                null,
                account.departmentCode(),
                null,
                account.role() != RoleName.ROLE_EMPLOYEE));
    }
}
