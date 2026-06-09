package nexusHR.insights.service;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.exception.ApiException;
import nexusHR.insights.security.JwtRequestContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
@Service
@RequiredArgsConstructor
public class WorkforceDataAggregator {
    @Value("${app.services.employee-url}")
    private String employeeUrl;

    @Value("${app.services.attendance-url}")
    private String attendanceUrl;

    @Value("${app.services.leave-url}")
    private String leaveUrl;

    @Value("${app.services.performance-url}")
    private String performanceUrl;

    public EmployeeWorkforceSnapshot aggregateForEmployee(Long employeeId) {
        String jwt = JwtRequestContext.getToken();
        if (jwt == null || jwt.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Missing JWT for downstream service calls");
        }

        JsonNode employee = fetchJson(employeeUrl + "/api/v1/employees/" + employeeId, jwt);
        if (employee == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Employee not found: " + employeeId);
        }

        String name = employee.path("firstName").asText("") + " " + employee.path("lastName").asText("");
        String department = textOrNull(employee, "departmentName");
        LocalDate hireDate = parseDate(employee.path("hireDate").asText(null));
        int tenureMonths = hireDate == null ? 0 : (int) ChronoUnit.MONTHS.between(hireDate, LocalDate.now());
        String status = employee.path("employmentStatus").asText("ACTIVE");

        JsonNode scorecard = fetchJsonOptional(
                performanceUrl + "/api/v1/performance/reviews/employee/" + employeeId + "/scorecard", jwt);
        Double avgRating = scorecard != null && !scorecard.path("averageOverallRating").isNull()
                ? scorecard.path("averageOverallRating").asDouble()
                : null;
        int totalReviews = scorecard != null ? scorecard.path("totalReviews").asInt(0) : 0;
        Map<String, Double> skillRatings = parseSkillRatings(scorecard);

        JsonNode leaves = fetchJsonOptional(leaveUrl + "/api/v1/leaves/employee/" + employeeId, jwt);
        int approvedDays = 0;
        int pendingLeaves = 0;
        if (leaves != null && leaves.isArray()) {
            LocalDate yearAgo = LocalDate.now().minusMonths(12);
            for (JsonNode leave : leaves) {
                String leaveStatus = leave.path("status").asText("");
                if ("PENDING".equalsIgnoreCase(leaveStatus)) {
                    pendingLeaves++;
                }
                if ("APPROVED".equalsIgnoreCase(leaveStatus)) {
                    LocalDate start = parseDate(leave.path("startDate").asText(null));
                    LocalDate end = parseDate(leave.path("endDate").asText(null));
                    if (start != null && end != null && !end.isBefore(yearAgo)) {
                        approvedDays += (int) ChronoUnit.DAYS.between(start, end) + 1;
                    }
                }
            }
        }
        JsonNode attendance = fetchJsonOptional(attendanceUrl + "/api/v1/attendance/employee/" + employeeId, jwt);
        int absent30 = 0;
        int present30 = 0;
        if (attendance != null && attendance.isArray()) {
            LocalDate cutoff = LocalDate.now().minusDays(30);
            for (JsonNode row : attendance) {
                LocalDate workDate = parseDate(row.path("workDate").asText(null));
                if (workDate == null || workDate.isBefore(cutoff)) {
                    continue;
                }
                String attendanceStatus = row.path("status").asText("");
                if ("ABSENT".equalsIgnoreCase(attendanceStatus)) {
                    absent30++;
                } else if ("PRESENT".equalsIgnoreCase(attendanceStatus)
                        || "LATE".equalsIgnoreCase(attendanceStatus)) {
                    present30++;
                }
            }
        }
        return new EmployeeWorkforceSnapshot(
                employeeId,
                name.trim(),
                department,
                hireDate,
                Math.max(tenureMonths, 0),
                status,
                avgRating,
                totalReviews,
                approvedDays,
                pendingLeaves,
                absent30,
                present30,
                skillRatings);
    }
    public List<JsonNode> fetchAllEmployees() {
        String jwt = JwtRequestContext.getToken();
        if (jwt == null || jwt.isBlank()) {
            return List.of();
        }
        JsonNode employees = fetchJsonOptional(employeeUrl + "/api/v1/employees", jwt);
        if (employees == null || !employees.isArray()) {
            return List.of();
        }
        return iterableToList(employees);
    }

    public List<JsonNode> fetchPendingLeaves() {
        String jwt = JwtRequestContext.getToken();
        if (jwt == null || jwt.isBlank()) {
            return List.of();
        }
        JsonNode leaves = fetchJsonOptional(leaveUrl + "/api/v1/leaves/pending", jwt);
        if (leaves == null || !leaves.isArray()) {
            return List.of();
        }
        return iterableToList(leaves);
    }
    private JsonNode fetchJson(String url, String jwt) {
        try {
            return restClient(jwt).get().uri(url).retrieve().body(JsonNode.class);
        } catch (RestClientException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Failed to call " + url + ": " + ex.getMessage());
        }
    }
    private JsonNode fetchJsonOptional(String url, String jwt) {
        try {
            return restClient(jwt).get().uri(url).retrieve().body(JsonNode.class);
        } catch (RestClientException ex) {
            return null;
        }
    }
    private RestClient restClient(String jwt) {
        return RestClient.builder()
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                .build();
    }
    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDate.parse(value);
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }
    private static List<JsonNode> iterableToList(JsonNode array) {
        List<JsonNode> items = new java.util.ArrayList<>();
        array.forEach(items::add);
        return items;
    }
    private static Map<String, Double> parseSkillRatings(JsonNode scorecard) {
        if (scorecard == null) {
            return Map.of();
        }
        JsonNode byCriterion = scorecard.path("averageByCriterion");
        if (byCriterion.isMissingNode() || !byCriterion.isObject()) {
            return Map.of();
        }
        Map<String, Double> ratings = new HashMap<>();
        byCriterion.fields().forEachRemaining(entry -> {
            if (!entry.getValue().isNull()) {
                ratings.put(entry.getKey(), entry.getValue().asDouble());
            }
        });
        return Map.copyOf(ratings);
    }
}
