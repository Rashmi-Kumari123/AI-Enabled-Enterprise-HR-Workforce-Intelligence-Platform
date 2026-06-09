package nexusHR.notification.integration;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import nexusHR.notification.dto.PendingLeaveSnapshot;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class LeaveServiceClient {
    private final RestClient restClient;
    private final String internalKey;
    public LeaveServiceClient(
            @Value("${app.services.leave-url:http://localhost:8085}") String leaveUrl,
            @Value("${app.services.leave-internal-key:nexushr-internal-dev-key}") String internalKey) {
        this.internalKey = internalKey;
        this.restClient = RestClient.builder().baseUrl(leaveUrl).build();
    }
    public List<PendingLeaveSnapshot> fetchPendingLeaves() {
        try {
            JsonNode response = restClient
                    .get()
                    .uri("/api/v1/leaves/internal/pending")
                    .header("X-Internal-Key", internalKey)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null || !response.isArray()) {
                return List.of();
            }
            return Arrays.stream(toArray(response)).map(this::toSnapshot).toList();
        } catch (Exception ex) {
            log.warn("Failed to fetch pending leaves for reminders: {}", ex.getMessage());
            return List.of();
        }
    }
    private PendingLeaveSnapshot toSnapshot(JsonNode node) {
        return new PendingLeaveSnapshot(
                node.path("id").asLong(),
                node.path("employeeId").asLong(),
                textOrNull(node, "employeeEmail"),
                textOrNull(node, "employeePhone"),
                node.path("leaveType").asText(null),
                node.path("status").asText(null),
                node.hasNonNull("submittedAt") ? java.time.Instant.parse(node.path("submittedAt").asText()) : null);
    }
    private static JsonNode[] toArray(JsonNode array) {
        JsonNode[] items = new JsonNode[array.size()];
        for (int i = 0; i < array.size(); i++) {
            items[i] = array.get(i);
        }
        return items;
    }
    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }
}
