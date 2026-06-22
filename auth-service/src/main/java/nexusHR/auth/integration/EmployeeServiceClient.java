package nexusHR.auth.integration;
import lombok.extern.slf4j.Slf4j;
import nexusHR.auth.dto.InternalOnboardEmployeeRequest;
import nexusHR.common.tenant.TenantContext;
import nexusHR.common.tenant.TenantHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

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
    public void seedTenantDepartments(Long tenantId, String slug) {
        try {
            restClient
                    .post()
                    .uri("/api/v1/employees/internal/seed-departments")
                    .header("X-Internal-Key", internalKey)
                    .header(TenantHeaders.TENANT_ID, String.valueOf(tenantId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(java.util.Map.of("slug", slug))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Department seed failed for tenant {}: {}", tenantId, ex.getMessage());
        }
    }
    public void onboardEmployee(InternalOnboardEmployeeRequest request) {
        provisionEmployee(request);
    }
    public void provisionEmployee(InternalOnboardEmployeeRequest request) {
        try {
            restClient
                    .post()
                    .uri("/api/v1/employees/internal/provision")
                    .header("X-Internal-Key", internalKey)
                    .header(TenantHeaders.TENANT_ID, String.valueOf(request.tenantId()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Employee profile sync failed for user {}: {}", request.userId(), ex.getMessage());
        }
    }
    public EmployeeOnboardResult onboardEmployeeForHire(InternalOnboardEmployeeRequest request) {
        try {
            return restClient
                    .post()
                    .uri("/api/v1/employees/internal/onboard")
                    .header("X-Internal-Key", internalKey)
                    .header(TenantHeaders.TENANT_ID, String.valueOf(request.tenantId()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(EmployeeOnboardResult.class);
        } catch (HttpClientErrorException.Conflict ex) {
            throw new IllegalStateException("User already linked to an employee profile", ex);
        } catch (RestClientException ex) {
            throw new IllegalStateException("Employee profile could not be created: " + ex.getMessage(), ex);
        }
    }
    private RestClient.RequestBodySpec withTenant(RestClient.RequestBodySpec spec) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return spec.header(TenantHeaders.TENANT_ID, String.valueOf(tenantId));
        }
        return spec;
    }
}
