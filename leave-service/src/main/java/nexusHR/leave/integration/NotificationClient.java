package nexusHR.leave.integration;
import lombok.extern.slf4j.Slf4j;
import nexusHR.leave.dto.NotificationDispatchPayload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
@Slf4j
@Component
@ConditionalOnProperty(name = "app.notifications.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationClient {
    private final RestClient restClient;
    private final String internalKey;
    public NotificationClient(
            @Value("${app.notifications.url}") String notificationUrl,
            @Value("${app.notifications.internal-key}") String internalKey) {
        this.internalKey = internalKey;
        this.restClient = RestClient.builder().baseUrl(notificationUrl).build();
    }
    public void dispatch(NotificationDispatchPayload payload) {
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
            log.warn("Failed to dispatch notification: {}", ex.getMessage());
        }
    }
}
