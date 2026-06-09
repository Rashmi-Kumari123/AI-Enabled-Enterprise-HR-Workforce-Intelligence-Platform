package nexusHR.insights.dto;
import java.util.List;
public record TeamAttritionInsightsResponse(
        int employeeCount,
        int highRiskCount,
        int mediumRiskCount,
        List<AttritionPredictionResponse> predictions) {}
