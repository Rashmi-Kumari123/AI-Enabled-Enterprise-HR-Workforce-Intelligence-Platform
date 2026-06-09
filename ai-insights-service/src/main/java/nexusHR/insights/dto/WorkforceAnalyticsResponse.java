package nexusHR.insights.dto;
import java.util.List;
import java.util.Map;
public record WorkforceAnalyticsResponse(
        int totalEmployees,
        int activeEmployees,
        int inactiveEmployees,
        int departmentCount,
        int pendingLeaveRequests,
        double averageEngagementScore,
        int highAttritionRisk,
        int mediumAttritionRisk,
        int employeesWithSkillGaps,
        int totalSkillGaps,
        Map<String, Integer> employmentStatusBreakdown,
        List<DepartmentAnalytics> departmentBreakdown,
        List<AttritionPredictionResponse> topAttritionRisks) {}
