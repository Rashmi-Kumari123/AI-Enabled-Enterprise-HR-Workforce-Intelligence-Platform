package nexusHR.auth.service;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.dto.AuthResponse;
import nexusHR.auth.dto.LoginRequest;
import nexusHR.auth.dto.MessageResponse;
import nexusHR.auth.dto.RefreshTokenRequest;
import nexusHR.auth.dto.SignupRequest;
import nexusHR.auth.entity.RefreshToken;
import nexusHR.auth.entity.Role;
import nexusHR.auth.entity.User;
import nexusHR.auth.exception.ApiException;
import nexusHR.auth.repository.RefreshTokenRepository;
import nexusHR.auth.repository.RoleRepository;
import nexusHR.auth.repository.UserRepository;
import nexusHR.auth.security.JwtService;
import nexusHR.auth.security.UserPrincipal;
import nexusHR.common.enums.RoleName;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        Role employeeRole = roleRepository
                .findByName(RoleName.ROLE_EMPLOYEE)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Default role not configured"));

        User user = new User();
        user.setEmail(request.email().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.getRoles().add(employeeRole);
        userRepository.save(user);
        return issueTokens(user);
    }
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase().trim(), request.password()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository
                .findByEmail(principal.getUsername())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        refreshTokenRepository.revokeAllActiveByUser(user);
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
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        return issueTokens(refreshToken.getUser());
    }
    @Transactional
    public MessageResponse logout(RefreshTokenRequest request) {
        refreshTokenRepository
                .findByTokenAndRevokedFalse(request.refreshToken())
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
        return new MessageResponse("Logged out successfully");
    }
    private AuthResponse issueTokens(User user) {
        UserPrincipal principal = UserPrincipal.from(user);
        String accessToken = jwtService.generateToken(principal);
        String refreshToken = persistRefreshToken(user);

        Set<String> roles =
                user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getExpirationSeconds(),
                user.getEmail(),
                roles);
    }
    private String persistRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiryAt = Instant.now().plusMillis(refreshExpirationMs);
        refreshTokenRepository.save(new RefreshToken(user, token, expiryAt));
        return token;
    }
}
