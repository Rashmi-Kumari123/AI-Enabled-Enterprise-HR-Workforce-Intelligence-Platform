package nexusHR.employee.integration;

import java.util.Optional;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import nexusHR.common.util.EmailRoleHeuristic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class AuthServiceClient {
    public record InternalUserResponse(Long id, String email, Set<String> roles, boolean enabled) {}

    private final RestClient restClient;
    private final String internalKey;

    public AuthServiceClient(
            @Value("${app.services.auth-url:http://localhost:8081}") String authUrl,
            @Value("${app.auth.internal-key:nexushr-internal-dev-key}") String internalKey) {
        this.internalKey = internalKey;
        this.restClient = RestClient.builder().baseUrl(authUrl).build();
    }

    public void disableUser(Long userId) {
        try {
            restClient
                    .post()
                    .uri("/api/v1/auth/internal/users/{userId}/disable", userId)
                    .header("X-Internal-Key", internalKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Failed to disable auth user {}: {}", userId, ex.getMessage());
        }
    }
    public Optional<InternalUserResponse> findUserById(Long userId) {
        try {
            return Optional.ofNullable(restClient
                    .get()
                    .uri("/api/v1/auth/internal/users/{userId}", userId)
                    .header("X-Internal-Key", internalKey)
                    .retrieve()
                    .body(InternalUserResponse.class));
        } catch (Exception ex) {
            log.debug("Could not resolve auth user {}: {}", userId, ex.getMessage());
            return Optional.empty();
        }
    }
    public boolean isPlatformOperator(Long userId, String email) {
        return findUserById(userId)
                .map(user -> user.roles().stream().anyMatch(role -> !"ROLE_EMPLOYEE".equals(role)))
                .orElseGet(() -> EmailRoleHeuristic.isPlatformOperatorEmail(email));
    }
}
