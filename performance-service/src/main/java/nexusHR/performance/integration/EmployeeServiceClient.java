package nexusHR.performance.integration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Collections;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import nexusHR.common.tenant.TenantContext;
import nexusHR.common.tenant.TenantHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class EmployeeServiceClient {
    private final RestClient restClient;
    private final String internalKey;

    public EmployeeServiceClient(
            @Value("${app.services.employee-url:http://localhost:8082}") String employeeUrl,
            @Value("${app.employee.internal-key:nexushr-internal-dev-key}") String internalKey) {
        this.internalKey = internalKey;
        this.restClient = RestClient.builder().baseUrl(employeeUrl).build();
    }

    public EmployeeSnapshot fetchEmployee(Long employeeId) {
        try {
            var spec = restClient
                    .get()
                    .uri("/api/v1/employees/internal/{id}", employeeId)
                    .header("X-Internal-Key", internalKey);
            Long tenantId = TenantContext.getTenantId();
            if (tenantId != null) {
                spec.header(TenantHeaders.TENANT_ID, tenantId.toString());
            }
            return spec.retrieve().body(EmployeeSnapshot.class);
        } catch (Exception ex) {
            log.warn("Failed to fetch employee {} for performance: {}", employeeId, ex.getMessage());
            return null;
        }
    }

    public List<EmployeeSnapshot> fetchActiveEmployees() {
        try {
            var spec = restClient
                    .get()
                    .uri("/api/v1/employees/internal/active")
                    .header("X-Internal-Key", internalKey);
            Long tenantId = TenantContext.getTenantId();
            if (tenantId != null) {
                spec.header(TenantHeaders.TENANT_ID, tenantId.toString());
            }
            EmployeeSnapshot[] employees = spec.retrieve().body(EmployeeSnapshot[].class);
            if (employees == null) {
                return Collections.emptyList();
            }
            return List.of(employees);
        } catch (Exception ex) {
            log.warn("Failed to fetch active employees for performance: {}", ex.getMessage());
            return Collections.emptyList();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EmployeeSnapshot(
            Long id, String employeeCode, String firstName, String lastName, String email, String employmentStatus) {
        public String fullName() {
            return firstName + " " + lastName;
        }
    }
}
