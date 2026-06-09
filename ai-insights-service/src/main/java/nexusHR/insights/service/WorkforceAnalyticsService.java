package nexusHR.insights.service;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.insights.dto.AttritionPredictionResponse;
import nexusHR.insights.dto.DepartmentAnalytics;
import nexusHR.insights.dto.TeamAttritionInsightsResponse;
import nexusHR.insights.dto.TeamEngagementInsightsResponse;
import nexusHR.insights.dto.TeamSkillGapInsightsResponse;
import nexusHR.insights.dto.WorkforceAnalyticsResponse;
import nexusHR.insights.enums.RiskLevel;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class WorkforceAnalyticsService {
    private final WorkforceDataAggregator workforceDataAggregator;
    private final AttritionInsightService attritionInsightService;
    private final WorkforceIntelligenceService workforceIntelligenceService;

    public WorkforceAnalyticsResponse getWorkforceAnalytics() {
        List<JsonNode> employees = workforceDataAggregator.fetchAllEmployees();
        List<JsonNode> pendingLeaves = workforceDataAggregator.fetchPendingLeaves();

        TeamAttritionInsightsResponse attrition = attritionInsightService.predictForTeam();
        TeamEngagementInsightsResponse engagement = workforceIntelligenceService.engagementForTeam();
        TeamSkillGapInsightsResponse skills = workforceIntelligenceService.skillGapsForTeam();

        Map<String, Integer> statusBreakdown = new HashMap<>();
        Map<String, DepartmentAnalyticsBuilder> departments = new HashMap<>();

        for (JsonNode employee : employees) {
            String status = employee.path("employmentStatus").asText("UNKNOWN");
            statusBreakdown.merge(status, 1, Integer::sum);

            String department = employee.path("departmentName").asText("Unassigned");
            DepartmentAnalyticsBuilder builder =
                    departments.computeIfAbsent(department, key -> new DepartmentAnalyticsBuilder(key));
            builder.employeeCount++;
            if ("ACTIVE".equalsIgnoreCase(status)) {
                builder.activeCount++;
            }
        }
        int activeEmployees = statusBreakdown.getOrDefault("ACTIVE", 0);
        int totalEmployees = employees.size();
        int inactiveEmployees = totalEmployees - activeEmployees;

        List<DepartmentAnalytics> departmentBreakdown = departments.values().stream()
                .map(builder -> new DepartmentAnalytics(
                        builder.department, builder.employeeCount, builder.activeCount))
                .sorted(Comparator.comparingInt(DepartmentAnalytics::employeeCount).reversed())
                .toList();

        List<AttritionPredictionResponse> topRisks = attrition.predictions().stream()
                .filter(p -> p.riskLevel() == RiskLevel.HIGH || p.riskLevel() == RiskLevel.MEDIUM)
                .limit(5)
                .toList();

        return new WorkforceAnalyticsResponse(
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                departmentBreakdown.size(),
                pendingLeaves.size(),
                engagement.averageEngagementScore(),
                attrition.highRiskCount(),
                attrition.mediumRiskCount(),
                skills.employeesWithGaps(),
                skills.totalGapCount(),
                Map.copyOf(statusBreakdown),
                departmentBreakdown,
                topRisks);
    }
    private static final class DepartmentAnalyticsBuilder {
        private final String department;
        private int employeeCount;
        private int activeCount;

        private DepartmentAnalyticsBuilder(String department) {
            this.department = department;
        }
    }
}
