package nexusHR.insights.dto;
import java.util.List;
import nexusHR.insights.enums.RiskLevel;
public record AttritionRiskAssessment(int riskScore, RiskLevel riskLevel, List<String> riskFactors) {}
