package nexusHR.auth.service;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.dto.AuthResponse;
import nexusHR.auth.dto.InternalOnboardEmployeeRequest;
import nexusHR.auth.dto.TenantRegisterRequest;
import nexusHR.auth.entity.Organization;
import nexusHR.auth.entity.Role;
import nexusHR.auth.entity.SubscriptionPlan;
import nexusHR.auth.entity.User;
import nexusHR.auth.exception.ApiException;
import nexusHR.auth.integration.EmployeeServiceClient;
import nexusHR.auth.repository.OrganizationRepository;
import nexusHR.auth.repository.RoleRepository;
import nexusHR.auth.repository.SubscriptionPlanRepository;
import nexusHR.auth.repository.UserRepository;
import nexusHR.common.enums.RoleName;
import nexusHR.common.tenant.TenantContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrganizationRegistrationService {
    private final OrganizationRepository organizationRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeServiceClient employeeServiceClient;
    private final @Lazy AuthService authService;

    @Transactional
    public AuthResponse registerTenant(TenantRegisterRequest request) {
        String slug = request.slug().toLowerCase().trim();
        String email = request.adminEmail().toLowerCase().trim();
        if (organizationRepository.existsBySlugIgnoreCase(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Company slug already taken");
        }

        SubscriptionPlan plan = subscriptionPlanRepository
                .findByCode("STARTER")
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Starter plan not configured"));
        Role adminRole = roleRepository
                .findByName(RoleName.ROLE_SUPER_ADMIN)
                .orElseGet(() -> roleRepository
                        .findByName(RoleName.ROLE_ADMIN)
                        .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Admin role not configured")));

        Organization organization = new Organization();
        organization.setName(request.companyName().trim());
        organization.setSlug(slug);
        organization.setPlan(plan);
        organization.setSeatCount(1);
        Organization savedOrg = organizationRepository.save(organization);

        User admin = new User();
        admin.setTenant(savedOrg);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(request.password()));
        admin.getRoles().add(adminRole);
        User savedAdmin = userRepository.save(admin);

        TenantContext.setTenantId(savedOrg.getId());
        employeeServiceClient.seedTenantDepartments(savedOrg.getId(), slug);
        employeeServiceClient.onboardEmployee(new InternalOnboardEmployeeRequest(
                savedOrg.getId(),
                savedAdmin.getId(),
                request.firstName().trim(),
                request.lastName().trim(),
                savedAdmin.getEmail(),
                null,
                null,
                null,
                null,
                true));

        return authService.issueTokensForUser(savedAdmin);
    }
}
