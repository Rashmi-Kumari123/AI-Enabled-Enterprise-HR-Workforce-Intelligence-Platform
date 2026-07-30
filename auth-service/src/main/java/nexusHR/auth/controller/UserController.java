package nexusHR.auth.controller;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.dto.UserProfileResponse;
import nexusHR.auth.entity.User;
import nexusHR.auth.repository.UserRepository;
import nexusHR.auth.security.UserPrincipal;
import nexusHR.common.security.SecurityExpressions;
import nexusHR.common.tenant.TenantContext;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    /** Any authenticated user. */
    @GetMapping("/me")
    public UserProfileResponse getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return toProfile(principal.getId(), principal.getEmail(), principal.isEnabled(), principal.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet()));
    }

    /** Admin only — list all registered users. */
    @GetMapping
    @PreAuthorize(SecurityExpressions.TENANT_ADMIN_OR_IT)
    public List<UserProfileResponse> listAllUsers() {
        Long tenantId = TenantContext.requireTenantId();
        return userRepository.findAllByTenantId(tenantId).stream().map(this::toProfile).toList();
    }

    /** HR or Admin — workforce summary stub*/
    @GetMapping("/hr/dashboard")
    @PreAuthorize(SecurityExpressions.TENANT_ADMIN)
    public Map<String, Object> hrDashboard() {
        return Map.of(
                "message", "HR dashboard",
                "registeredUsers", userRepository.countByTenantId(TenantContext.requireTenantId()),
                "access", "ROLE_HR or ROLE_ADMIN required");
    }

    private UserProfileResponse toProfile(User user) {
        return toProfile(
                user.getId(),
                user.getEmail(),
                user.isEnabled(),
                user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()));
    }

    private UserProfileResponse toProfile(
            Long id, String email, boolean enabled, java.util.Set<String> roles) {
        return new UserProfileResponse(id, email, roles, enabled);
    }
}
