package nexusHR.insights.dto;
import java.util.List;
import nexusHR.insights.enums.EngagementLevel;
public record EngagementScoreResponse(
        Long employeeId,
        String employeeName,
        String department,
        int engagementScore,
        EngagementLevel engagementLevel,
        List<String> scoreFactors,
        List<String> recommendations) {}
