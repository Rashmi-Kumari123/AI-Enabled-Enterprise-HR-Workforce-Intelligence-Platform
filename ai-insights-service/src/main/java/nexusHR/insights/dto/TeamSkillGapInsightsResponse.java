package nexusHR.insights.dto;
import java.util.List;
public record TeamSkillGapInsightsResponse(
        int employeeCount,
        int employeesWithGaps,
        int totalGapCount,
        List<SkillGapAnalysisResponse> analyses) {}
