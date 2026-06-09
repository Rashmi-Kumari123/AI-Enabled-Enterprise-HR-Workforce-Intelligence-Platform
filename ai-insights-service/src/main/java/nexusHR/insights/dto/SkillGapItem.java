package nexusHR.insights.dto;
import java.util.List;
import nexusHR.insights.enums.GapPriority;
public record SkillGapItem(
        String skill,
        String skillCode,
        double currentScore,
        double targetScore,
        double gap,
        GapPriority priority,
        String recommendation) {}
