package nexusHR.employee.integration;
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
    public void seedBalances(Long employeeId) {
        try {
            restClient
                    .post()
                    .uri("/api/v1/leaves/internal/balances/seed/{employeeId}", employeeId)
                    .header("X-Internal-Key", internalKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Failed to seed leave balances for employee {}: {}", employeeId, ex.getMessage());
        }
    }
}
