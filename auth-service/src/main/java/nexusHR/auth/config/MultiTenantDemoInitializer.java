package nexusHR.auth.config;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.auth.dto.InternalOnboardEmployeeRequest;
import nexusHR.auth.entity.Organization;
import nexusHR.auth.entity.Role;
import nexusHR.auth.entity.SubscriptionPlan;
import nexusHR.auth.entity.User;
import nexusHR.auth.integration.EmployeeServiceClient;
import nexusHR.auth.repository.OrganizationRepository;
import nexusHR.auth.repository.RoleRepository;
import nexusHR.auth.repository.SubscriptionPlanRepository;
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
@Order(3)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.multi-tenant-enabled", havingValue = "true", matchIfMissing = false)
public class MultiTenantDemoInitializer implements ApplicationRunner {
    public static final String DEMO_PASSWORD = DemoUserInitializer.DEMO_PASSWORD;
    private final OrganizationRepository organizationRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeServiceClient employeeServiceClient;

    @Value("${app.demo.seed-enabled:true}")
    private boolean seedEnabled;

    private record TenantSeed(String slug, String name, DemoUserInitializer.DemoAccount[] accounts) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            return;
        }
        SubscriptionPlan starter = subscriptionPlanRepository
                .findByCode("STARTER")
                .orElseThrow(() -> new IllegalStateException("Starter plan missing"));

        seedTenant(new TenantSeed(
                "beans",
                "Beans.ai",
                new DemoUserInitializer.DemoAccount[] {
                    new DemoUserInitializer.DemoAccount(
                            "admin@beans.ai", RoleName.ROLE_ADMIN, "Beans", "Admin", "IT"),
                    new DemoUserInitializer.DemoAccount(
                            "hr@beans.ai", RoleName.ROLE_HR, "Beans", "HR", "HR"),
                    new DemoUserInitializer.DemoAccount(
                            "employee@beans.ai", RoleName.ROLE_EMPLOYEE, "Beans", "Employee", "IT"),
                }),
                starter);

        seedTenant(new TenantSeed(
                "klearnow",
                "Klearnow.ai",
                new DemoUserInitializer.DemoAccount[] {
                    new DemoUserInitializer.DemoAccount(
                            "admin@klearnow.ai", RoleName.ROLE_ADMIN, "Klearnow", "Admin", "IT"),
                    new DemoUserInitializer.DemoAccount(
                            "hr@klearnow.ai", RoleName.ROLE_HR, "Klearnow", "HR", "HR"),
                }),
                starter);
    }

    private void seedTenant(TenantSeed seed, SubscriptionPlan plan) {
        Organization tenant = organizationRepository
                .findBySlugIgnoreCase(seed.slug())
                .orElseGet(() -> {
                    Organization organization = new Organization();
                    organization.setName(seed.name());
                    organization.setSlug(seed.slug());
                    organization.setPlan(plan);
                    organization.setSeatCount(0);
                    return organizationRepository.save(organization);
                });

        TenantContext.setTenantId(tenant.getId());
        employeeServiceClient.seedTenantDepartments(tenant.getId(), tenant.getSlug());

        for (DemoUserInitializer.DemoAccount account : seed.accounts()) {
            seedAccount(tenant, account);
        }
        log.info("Seeded tenant {} with {} accounts", tenant.getSlug(), seed.accounts().length);
    }

    private void seedAccount(Organization tenant, DemoUserInitializer.DemoAccount account) {
        String email = account.email().toLowerCase().trim();
        if (userRepository.existsByTenantIdAndEmail(tenant.getId(), email)) {
            return;
        }
        Role role = roleRepository
                .findByName(account.role())
                .orElseThrow(() -> new IllegalStateException("Role missing: " + account.role()));

        User user = new User();
        user.setTenant(tenant);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
        user.getRoles().add(role);
        User saved = userRepository.save(user);
        tenant.setSeatCount(tenant.getSeatCount() + 1);

        employeeServiceClient.onboardEmployee(new InternalOnboardEmployeeRequest(
                tenant.getId(),
                saved.getId(),
                account.firstName(),
                account.lastName(),
                saved.getEmail(),
                null,
                null,
                account.departmentCode(),
                null,
                account.role() != RoleName.ROLE_EMPLOYEE));
    }
}
