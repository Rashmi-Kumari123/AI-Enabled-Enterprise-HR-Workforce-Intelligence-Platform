package nexusHR.insights.dto;
import java.util.List;
import nexusHR.insights.enums.AiProvider;
import nexusHR.insights.enums.RiskLevel;
public record AttritionPredictionResponse(
        Long employeeId,
        String employeeName,
        String department,
        int riskScore,
        RiskLevel riskLevel,
        List<String> riskFactors,
        String aiSummary,
        List<String> recommendations,
        AiProvider provider,
        boolean aiEnabled) {}
