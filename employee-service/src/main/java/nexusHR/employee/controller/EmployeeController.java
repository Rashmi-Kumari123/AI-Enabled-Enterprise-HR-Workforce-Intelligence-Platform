package nexusHR.employee.controller;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.tenant.TenantContext;
import nexusHR.employee.dto.EmployeeProfileUpdateRequest;
import nexusHR.employee.dto.EmployeeProvisionRequest;
import nexusHR.employee.dto.EmployeeRequest;
import nexusHR.employee.dto.EmployeeResponse;
import nexusHR.employee.dto.InternalOnboardRequest;
import nexusHR.employee.security.JwtService;
import nexusHR.employee.service.EmployeeLifecycleService;
import nexusHR.employee.service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;
    private final EmployeeLifecycleService employeeLifecycleService;
    private final JwtService jwtService;
    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public List<EmployeeResponse> listEmployees() {
        return employeeService.findAll();
    }
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER', 'EMPLOYEE')")
    public EmployeeResponse getMyProfile(Authentication authentication, HttpServletRequest request) {
        return employeeService.findMyProfile(extractUserId(request), authentication.getName());
    }

    @PatchMapping("/me")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER', 'EMPLOYEE')")
    public EmployeeResponse updateMyProfile(
            Authentication authentication,
            HttpServletRequest request,
            @Valid @RequestBody EmployeeProfileUpdateRequest body) {
        return employeeService.updateMyProfile(extractUserId(request), authentication.getName(), body);
    }
    @PostMapping("/me/provision")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER', 'EMPLOYEE')")
    public EmployeeResponse provisionMyProfile(
            Authentication authentication,
            HttpServletRequest request,
            @Valid @RequestBody EmployeeProvisionRequest body) {
        Long userId = extractUserId(request);
        if (userId == null) {
            throw new nexusHR.employee.exception.ApiException(
                    HttpStatus.BAD_REQUEST, "Sign in again — account ID missing from session");
        }
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                tenantId = jwtService.extractTenantId(header.substring(7));
            }
        }
        if (tenantId == null) {
            throw new nexusHR.employee.exception.ApiException(
                    HttpStatus.BAD_REQUEST, "Tenant context missing — sign in again");
        }
        return employeeLifecycleService.provisionIfMissing(new InternalOnboardRequest(
                tenantId,
                userId,
                body.firstName(),
                body.lastName(),
                authentication.getName(),
                null,
                null,
                null,
                null,
                false));
    }
    private Long extractUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        try {
            return jwtService.extractUserId(header.substring(7));
        } catch (Exception ex) {
            return null;
        }
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER', 'EMPLOYEE')")
    public EmployeeResponse getEmployee(@PathVariable Long id) {
        return employeeService.findById(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public EmployeeResponse createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public EmployeeResponse updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.update(id, request);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.delete(id);
    }
}
