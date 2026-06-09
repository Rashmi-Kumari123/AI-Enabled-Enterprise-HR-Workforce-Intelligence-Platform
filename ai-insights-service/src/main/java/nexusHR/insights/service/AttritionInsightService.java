package nexusHR.insights.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.insights.dto.AttritionPredictRequest;
import nexusHR.insights.dto.AttritionPredictionResponse;
import nexusHR.insights.dto.AttritionRiskAssessment;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.dto.TeamAttritionInsightsResponse;
import nexusHR.insights.enums.RiskLevel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AttritionInsightService {
    private final WorkforceDataAggregator workforceDataAggregator;
    private final AttritionRiskScorer attritionRiskScorer;
    private final AttritionAiAdvisor attritionAiAdvisor;

    public AttritionPredictionResponse predictFromRequest(AttritionPredictRequest request) {
        return buildPrediction(EmployeeWorkforceSnapshot.fromRequest(request));
    }
    public AttritionPredictionResponse predictForEmployee(Long employeeId) {
        EmployeeWorkforceSnapshot snapshot = workforceDataAggregator.aggregateForEmployee(employeeId);
        return buildPrediction(snapshot);
    }
    public TeamAttritionInsightsResponse predictForTeam() {
        List<JsonNode> employees = workforceDataAggregator.fetchAllEmployees();
        List<AttritionPredictionResponse> predictions = employees.stream()
                .map(this::predictionFromEmployeeNode)
                .sorted(Comparator.comparingInt(AttritionPredictionResponse::riskScore).reversed())
                .toList();

        int high = (int) predictions.stream()
                .filter(p -> p.riskLevel() == RiskLevel.HIGH)
                .count();
        int medium = (int) predictions.stream()
                .filter(p -> p.riskLevel() == RiskLevel.MEDIUM)
                .count();

        return new TeamAttritionInsightsResponse(predictions.size(), high, medium, predictions);
    }
    private AttritionPredictionResponse predictionFromEmployeeNode(JsonNode employee) {
        Long id = employee.path("id").asLong();
        try {
            return predictForEmployee(id);
        } catch (Exception ex) {
            LocalDate hireDate = employee.hasNonNull("hireDate")
                    ? LocalDate.parse(employee.path("hireDate").asText())
                    : null;
            int tenure = hireDate == null ? 0 : (int) ChronoUnit.MONTHS.between(hireDate, LocalDate.now());
            AttritionPredictRequest fallback = new AttritionPredictRequest(
                    id,
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
            return predictFromRequest(fallback);
        }
    }
    private AttritionPredictionResponse buildPrediction(EmployeeWorkforceSnapshot snapshot) {
        AttritionRiskAssessment assessment = attritionRiskScorer.assess(snapshot);
        var ai = attritionAiAdvisor.generateInsights(snapshot, assessment);
        return new AttritionPredictionResponse(
                snapshot.employeeId(),
                snapshot.employeeName(),
                snapshot.department(),
                assessment.riskScore(),
                assessment.riskLevel(),
                assessment.riskFactors(),
                ai.summary(),
                ai.recommendations(),
                ai.provider(),
                ai.aiEnabled());
    }
}
