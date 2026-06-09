package nexusHR.insights.dto;
import java.util.List;
public record TeamEngagementInsightsResponse(
        int employeeCount,
        double averageEngagementScore,
        int highEngagementCount,
        int lowEngagementCount,
        List<EngagementScoreResponse> scores) {}
