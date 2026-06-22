package nexusHR.auth.dto;
import java.util.Set;
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        String email,
        java.util.Set<String> roles,
        Long tenantId,
        String tenantSlug,
        boolean mustChangePassword) {}
