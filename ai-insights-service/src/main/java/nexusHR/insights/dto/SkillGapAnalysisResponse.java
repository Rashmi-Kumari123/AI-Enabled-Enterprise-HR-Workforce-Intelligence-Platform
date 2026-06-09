package nexusHR.insights.dto;
import java.util.List;
public record SkillGapAnalysisResponse(
        Long employeeId,
        String employeeName,
        String department,
        double targetScore,
        int overallReadinessPercent,
        int gapCount,
        List<SkillGapItem> gaps,
        List<String> developmentPlan) {}
