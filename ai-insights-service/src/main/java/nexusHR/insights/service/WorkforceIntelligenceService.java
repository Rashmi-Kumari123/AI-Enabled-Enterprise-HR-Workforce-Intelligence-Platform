package nexusHR.insights.service;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.insights.dto.AttritionPredictRequest;
import nexusHR.insights.dto.EngagementScoreResponse;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.dto.SkillGapAnalysisResponse;
import nexusHR.insights.dto.TeamEngagementInsightsResponse;
import nexusHR.insights.dto.TeamSkillGapInsightsResponse;
import nexusHR.insights.enums.EngagementLevel;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class WorkforceIntelligenceService {
    private final WorkforceDataAggregator workforceDataAggregator;
    private final EngagementScorer engagementScorer;
    private final SkillGapAnalyzer skillGapAnalyzer;

    public EngagementScoreResponse engagementForEmployee(Long employeeId) {
        return engagementScorer.assess(workforceDataAggregator.aggregateForEmployee(employeeId));
    }
    public EngagementScoreResponse engagementFromRequest(AttritionPredictRequest request) {
        return engagementScorer.assess(EmployeeWorkforceSnapshot.fromRequest(request));
    }
    public SkillGapAnalysisResponse skillGapsForEmployee(Long employeeId) {
        return skillGapAnalyzer.analyze(workforceDataAggregator.aggregateForEmployee(employeeId));
    }
    public SkillGapAnalysisResponse skillGapsFromRequest(AttritionPredictRequest request) {
        return skillGapAnalyzer.analyze(EmployeeWorkforceSnapshot.fromRequest(request));
    }
    public TeamEngagementInsightsResponse engagementForTeam() {
        List<JsonNode> employees = workforceDataAggregator.fetchAllEmployees();
        List<EngagementScoreResponse> scores = employees.stream()
                .map(this::engagementFromEmployeeNode)
                .sorted(Comparator.comparingInt(EngagementScoreResponse::engagementScore))
                .toList();
        double average = scores.isEmpty()
                ? 0
                : scores.stream().mapToInt(EngagementScoreResponse::engagementScore).average().orElse(0);
        int high = (int) scores.stream()
                .filter(score -> score.engagementLevel() == EngagementLevel.HIGH)
                .count();
        int low = (int) scores.stream()
                .filter(score -> score.engagementLevel() == EngagementLevel.LOW)
                .count();
        return new TeamEngagementInsightsResponse(scores.size(), round(average), high, low, scores);
    }
    public TeamSkillGapInsightsResponse skillGapsForTeam() {
        List<JsonNode> employees = workforceDataAggregator.fetchAllEmployees();
        List<SkillGapAnalysisResponse> analyses = employees.stream()
                .map(this::skillGapsFromEmployeeNode)
                .sorted(Comparator.comparingInt(SkillGapAnalysisResponse::gapCount).reversed())
                .toList();
        int withGaps = (int) analyses.stream().filter(analysis -> analysis.gapCount() > 0).count();
        int totalGaps = analyses.stream().mapToInt(SkillGapAnalysisResponse::gapCount).sum();

        return new TeamSkillGapInsightsResponse(analyses.size(), withGaps, totalGaps, analyses);
    }
    private EngagementScoreResponse engagementFromEmployeeNode(JsonNode employee) {
        Long id = employee.path("id").asLong();
        try {
            return engagementForEmployee(id);
        } catch (Exception ex) {
            return engagementFromRequest(fallbackRequest(employee));
        }
    }
    private SkillGapAnalysisResponse skillGapsFromEmployeeNode(JsonNode employee) {
        Long id = employee.path("id").asLong();
        try {
            return skillGapsForEmployee(id);
        } catch (Exception ex) {
            return skillGapsFromRequest(fallbackRequest(employee));
        }
    }
    private AttritionPredictRequest fallbackRequest(JsonNode employee) {
        LocalDate hireDate = employee.hasNonNull("hireDate")
                ? LocalDate.parse(employee.path("hireDate").asText())
                : null;
        int tenure = hireDate == null ? 0 : (int) ChronoUnit.MONTHS.between(hireDate, LocalDate.now());
        return new AttritionPredictRequest(
                employee.path("id").asLong(),
                employee.path("firstName").asText("") + " " + employee.path("lastName").asText(""),
                employee.path("departmentName").asText(null),
                Math.max(tenure, 0),
                employee.path("employmentStatus").asText("ACTIVE"),
                null,
                0,
                0,
                0,
                0,
                0,
                null);
    }
    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
