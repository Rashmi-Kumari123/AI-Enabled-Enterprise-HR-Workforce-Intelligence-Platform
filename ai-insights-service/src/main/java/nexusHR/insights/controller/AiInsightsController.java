package nexusHR.insights.controller;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.common.security.SecurityExpressions;
import nexusHR.insights.dto.AttritionPredictRequest;
import nexusHR.insights.dto.AttritionPredictionResponse;
import nexusHR.insights.dto.EngagementScoreResponse;
import nexusHR.insights.dto.SkillGapAnalysisResponse;
import nexusHR.insights.dto.TeamAttritionInsightsResponse;
import nexusHR.insights.dto.TeamEngagementInsightsResponse;
import nexusHR.insights.dto.TeamSkillGapInsightsResponse;
import nexusHR.insights.dto.WorkforceAnalyticsResponse;
import nexusHR.insights.service.AttritionInsightService;
import nexusHR.insights.service.WorkforceAnalyticsService;
import nexusHR.insights.service.WorkforceIntelligenceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiInsightsController {
    private final AttritionInsightService attritionInsightService;
    private final WorkforceIntelligenceService workforceIntelligenceService;
    private final WorkforceAnalyticsService workforceAnalyticsService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "ai-insights-service");
    }
    @PostMapping("/attrition/predict")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public AttritionPredictionResponse predict(@Valid @RequestBody AttritionPredictRequest request) {
        return attritionInsightService.predictFromRequest(request);
    }
    @GetMapping("/attrition/employee/{employeeId}")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public AttritionPredictionResponse predictForEmployee(@PathVariable Long employeeId) {
        return attritionInsightService.predictForEmployee(employeeId);
    }
    @GetMapping("/attrition/team")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public TeamAttritionInsightsResponse predictForTeam() {
        return attritionInsightService.predictForTeam();
    }
    @GetMapping("/engagement/employee/{employeeId}")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public EngagementScoreResponse engagementForEmployee(@PathVariable Long employeeId) {
        return workforceIntelligenceService.engagementForEmployee(employeeId);
    }
    @PostMapping("/engagement/score")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public EngagementScoreResponse scoreEngagement(@Valid @RequestBody AttritionPredictRequest request) {
        return workforceIntelligenceService.engagementFromRequest(request);
    }
    @GetMapping("/engagement/team")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public TeamEngagementInsightsResponse engagementForTeam() {
        return workforceIntelligenceService.engagementForTeam();
    }
    @GetMapping("/skills/gaps/employee/{employeeId}")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public SkillGapAnalysisResponse skillGapsForEmployee(@PathVariable Long employeeId) {
        return workforceIntelligenceService.skillGapsForEmployee(employeeId);
    }
    @PostMapping("/skills/gaps/analyze")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public SkillGapAnalysisResponse analyzeSkillGaps(@Valid @RequestBody AttritionPredictRequest request) {
        return workforceIntelligenceService.skillGapsFromRequest(request);
    }
    @GetMapping("/skills/gaps/team")
    @PreAuthorize(SecurityExpressions.ANALYTICS)
    public TeamSkillGapInsightsResponse skillGapsForTeam() {
        return workforceIntelligenceService.skillGapsForTeam();
    }
    @GetMapping("/analytics/workforce")
    @PreAuthorize(SecurityExpressions.EXECUTIVE_READ)
    public WorkforceAnalyticsResponse workforceAnalytics() {
        return workforceAnalyticsService.getWorkforceAnalytics();
    }
}
