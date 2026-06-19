package nexusHR.auth.controller;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.dto.AuthResponse;
import nexusHR.auth.dto.HireEmployeeRequest;
import nexusHR.auth.dto.HireEmployeeResponse;
import nexusHR.auth.dto.LoginRequest;
import nexusHR.auth.dto.MessageResponse;
import nexusHR.auth.dto.RefreshTokenRequest;
import nexusHR.auth.dto.SignupRequest;
import nexusHR.auth.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "auth-service");
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    public MessageResponse logout(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.logout(request);
    }
    @PostMapping("/hire")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public HireEmployeeResponse hire(@Valid @RequestBody HireEmployeeRequest request) {
        return authService.hireEmployee(request);
    }
}
