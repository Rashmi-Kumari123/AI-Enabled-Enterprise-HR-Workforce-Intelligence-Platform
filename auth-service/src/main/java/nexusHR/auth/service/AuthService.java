package nexusHR.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.dto.AuthResponse;
import nexusHR.auth.dto.ChangePasswordRequest;
import nexusHR.auth.dto.HireEmployeeRequest;
import nexusHR.auth.dto.HireEmployeeResponse;
import nexusHR.auth.dto.InternalOnboardEmployeeRequest;
import nexusHR.auth.dto.LoginRequest;
import nexusHR.auth.dto.MessageResponse;
import nexusHR.auth.dto.RefreshTokenRequest;
import nexusHR.auth.dto.SignupRequest;
import nexusHR.auth.entity.Organization;
import nexusHR.auth.entity.RefreshToken;
import nexusHR.auth.entity.Role;
import nexusHR.auth.entity.User;
import nexusHR.auth.exception.ApiException;
import nexusHR.auth.integration.EmployeeOnboardResult;
import nexusHR.auth.integration.EmployeeServiceClient;
import nexusHR.auth.repository.OrganizationRepository;
import nexusHR.auth.repository.RefreshTokenRepository;
import nexusHR.auth.repository.RoleRepository;
import nexusHR.auth.repository.UserRepository;
import nexusHR.auth.security.JwtService;
import nexusHR.auth.security.UserPrincipal;
import nexusHR.auth.session.CachedSession;
import nexusHR.auth.session.SessionCacheService;
import nexusHR.common.enums.RoleName;
import nexusHR.common.tenant.TenantContext;
import nexusHR.common.util.EmailRoleHeuristic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SessionCacheService sessionCacheService;
    private final EmployeeServiceClient employeeServiceClient;
    private final TenantService tenantService;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long accessExpirationMs;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        Organization tenant = tenantService.requireById(TenantContext.requireTenantId());
        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByTenantIdAndEmail(tenant.getId(), email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered in this organization");
        }
        RoleName roleName = request.role().toRoleName();
        if (roleName == RoleName.ROLE_EMPLOYEE) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST, "Employees must be onboarded by HR. Use Add Employee instead.");
        }
        Role assignedRole = roleRepository
                .findByName(roleName)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Role not configured"));

        User user = new User();
        user.setTenant(tenant);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.getRoles().add(assignedRole);
        userRepository.save(user);

        employeeServiceClient.onboardEmployee(new InternalOnboardEmployeeRequest(
                tenant.getId(),
                user.getId(),
                request.firstName().trim(),
                request.lastName().trim(),
                user.getEmail(),
                null,
                null,
                null,
                null,
                assignedRole.getName() != RoleName.ROLE_EMPLOYEE));
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Long tenantId = TenantContext.requireTenantId();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase().trim(), request.password()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository
                .findByTenantIdAndEmail(tenantId, principal.getUsername())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        employeeServiceClient.provisionEmployee(new InternalOnboardEmployeeRequest(
                tenantId,
                user.getId(),
                "",
                "",
                user.getEmail(),
                null,
                null,
                null,
                null,
                isPlatformOperator(user)));

        refreshTokenRepository.revokeAllActiveByUser(user);
        sessionCacheService.invalidateAllForUser(user.getId());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndRevokedFalse(request.refreshToken())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        User user = refreshToken.getUser();
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        sessionCacheService.invalidateAllForUser(user.getId());
        TenantContext.setTenantId(user.getTenant().getId());
        return issueTokens(user);
    }
    @Transactional
    public MessageResponse logout(RefreshTokenRequest request) {
        refreshTokenRepository
                .findByTokenAndRevokedFalse(request.refreshToken())
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    sessionCacheService.invalidateAllForUser(token.getUser().getId());
                });
        return new MessageResponse("Logged out successfully");
    }
    @Transactional
    public MessageResponse changePassword(ChangePasswordRequest request) {
        UserPrincipal principal = currentPrincipal();
        User user = userRepository
                .findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
        refreshTokenRepository.revokeAllActiveByUser(user);
        sessionCacheService.invalidateAllForUser(user.getId());
        return new MessageResponse("Password updated successfully");
    }
    @Transactional
    public HireEmployeeResponse hireEmployee(HireEmployeeRequest request) {
        UserPrincipal principal = currentPrincipal();
        Organization tenant = tenantService.requireById(principal.getTenantId());
        ensureSeatAvailable(tenant);

        String email = request.email().toLowerCase().trim();
        if (userRepository.existsByTenantIdAndEmail(tenant.getId(), email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered in this organization");
        }
        Role employeeRole = roleRepository
                .findByName(RoleName.ROLE_EMPLOYEE)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Employee role not configured"));

        User user = new User();
        user.setTenant(tenant);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.temporaryPassword()));
        user.setMustChangePassword(true);
        user.getRoles().add(employeeRole);
        userRepository.save(user);
        tenant.setSeatCount(tenant.getSeatCount() + 1);
        organizationRepository.save(tenant);
        EmployeeOnboardResult employee;
        try {
            employee = employeeServiceClient.onboardEmployeeForHire(new InternalOnboardEmployeeRequest(
                    tenant.getId(),
                    user.getId(),
                    request.firstName().trim(),
                    request.lastName().trim(),
                    email,
                    request.phone(),
                    request.departmentId(),
                    null,
                    request.hireDate(),
                    false));
        } catch (IllegalStateException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, ex.getMessage());
        }
        if (employee == null || employee.id() == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Employee profile could not be created");
        }

        return new HireEmployeeResponse(
                user.getId(),
                employee.id(),
                employee.employeeCode(),
                email,
                employee.firstName(),
                employee.lastName(),
                "Employee hired successfully. Share login credentials securely.");
    }

    @Transactional(readOnly = true)
    public AuthResponse issueTokensForUser(User user) {
        return issueTokens(user);
    }
    private AuthResponse issueTokens(User user) {
        UserPrincipal principal = UserPrincipal.from(user);
        Set<String> roles =
                user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());

        String sessionId = UUID.randomUUID().toString();
        String accessToken = jwtService.generateToken(principal, sessionId);
        sessionCacheService.store(
                sessionId,
                new CachedSession(user.getId(), user.getEmail(), roles, Instant.now()),
                Duration.ofMillis(accessExpirationMs));

        String refreshToken = persistRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getExpirationSeconds(),
                user.getEmail(),
                roles,
                user.getTenant().getId(),
                user.getTenant().getSlug(),
                user.isMustChangePassword());
    }

    private String persistRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiryAt = Instant.now().plusMillis(refreshExpirationMs);
        refreshTokenRepository.save(new RefreshToken(user, token, expiryAt));
        return token;
    }
    private void ensureSeatAvailable(Organization tenant) {
        if (tenant.getSeatCount() >= tenant.getPlan().getMaxSeats()) {
            throw new ApiException(HttpStatus.PAYMENT_REQUIRED, "Seat limit reached for current plan");
        }
    }
    private static UserPrincipal currentPrincipal() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal;
        }
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }

    static RoleName resolveRoleFromEmail(String email) {
        return EmailRoleHeuristic.resolveRoleFromEmail(email);
    }
    private static boolean isPlatformOperator(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName() != RoleName.ROLE_EMPLOYEE);
    }
}
