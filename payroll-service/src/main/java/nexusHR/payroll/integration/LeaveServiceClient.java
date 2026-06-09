package nexusHR.payroll.integration;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
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
            @Value("${app.leave.internal-key:nexushr-internal-dev-key}") String internalKey) {
        this.internalKey = internalKey;
        this.restClient = RestClient.builder().baseUrl(leaveUrl).build();
    }
    public int fetchUnpaidLeaveDays(Long employeeId, int year, int month) {
        try {
            JsonNode response = restClient
                    .get()
                    .uri("/api/v1/leaves/internal/unpaid-days/{employeeId}?year={year}&month={month}",
                            employeeId, year, month)
                    .header("X-Internal-Key", internalKey)
                    .retrieve()
                    .body(JsonNode.class);
            return response != null ? response.path("unpaidLeaveDays").asInt(0) : 0;
        } catch (Exception ex) {
            log.warn("Failed to fetch unpaid leave days for employee {}: {}", employeeId, ex.getMessage());
            return 0;
        }
    }
}
