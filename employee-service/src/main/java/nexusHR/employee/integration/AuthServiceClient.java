package nexusHR.employee.integration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class AuthServiceClient {
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
}
