package nexusHR.auth.controller;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.dto.AuthResponse;
import nexusHR.auth.dto.TenantRegisterRequest;
import nexusHR.auth.service.OrganizationRegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/v1/tenants")
@ConditionalOnProperty(name = "app.multi-tenant.registration-enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
public class TenantController {
    private final OrganizationRegistrationService organizationRegistrationService;
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody TenantRegisterRequest request) {
        return organizationRegistrationService.registerTenant(request);
    }
}
