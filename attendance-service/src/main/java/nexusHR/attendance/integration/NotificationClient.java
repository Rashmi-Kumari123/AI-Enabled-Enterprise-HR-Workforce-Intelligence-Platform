package nexusHR.attendance.integration;
import nexusHR.attendance.dto.NotificationDispatchPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class NotificationClient {
    private final RestClient restClient;
    private final String internalKey;
    private final boolean enabled;

    public NotificationClient(
            @Value("${app.notifications.url:http://localhost:8089}") String notificationUrl,
            @Value("${app.notifications.internal-key:nexushr-internal-dev-key}") String internalKey,
            @Value("${app.notifications.enabled:true}") boolean enabled) {
        this.internalKey = internalKey;
        this.enabled = enabled;
        this.restClient = RestClient.builder().baseUrl(notificationUrl).build();
    }

    public void dispatch(NotificationDispatchPayload payload) {
        if (!enabled) {
            return;
        }
        try {
            restClient
                    .post()
                    .uri("/api/v1/notifications/internal/dispatch")
                    .header("X-Internal-Key", internalKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Failed to dispatch attendance notification: {}", ex.getMessage());
        }
    }
}
