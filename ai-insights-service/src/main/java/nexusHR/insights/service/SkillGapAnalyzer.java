package nexusHR.insights.service;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.dto.SkillGapAnalysisResponse;
import nexusHR.insights.dto.SkillGapItem;
import nexusHR.insights.enums.GapPriority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SkillGapAnalyzer {
    @Value("${app.ai.skills.target-score:4.0}")
    private double targetScore;

    public SkillGapAnalysisResponse analyze(EmployeeWorkforceSnapshot snapshot) {
        Map<String, Double> ratings = snapshot.skillRatingsByCriterion();
        if (ratings.isEmpty()) {
            return new SkillGapAnalysisResponse(
                    snapshot.employeeId(),
                    snapshot.employeeName(),
                    snapshot.department(),
                    targetScore,
                    snapshot.averagePerformanceRating() != null
                            ? (int) Math.round((snapshot.averagePerformanceRating() / 5.0) * 100)
                            : 0,
                    0,
                    List.of(),
                    List.of("No performance skill ratings available — complete a performance review first"));
        }
        List<SkillGapItem> gaps = new ArrayList<>();
        double ratingSum = 0;
        for (Map.Entry<String, Double> entry : ratings.entrySet()) {
            ratingSum += entry.getValue();
            if (entry.getValue() < targetScore) {
                gaps.add(new SkillGapItem(
                        humanizeSkill(entry.getKey()),
                        entry.getKey(),
                        round(entry.getValue()),
                        targetScore,
                        round(targetScore - entry.getValue()),
                        GapPriority.fromGap(targetScore - entry.getValue()),
                        trainingRecommendation(entry.getKey(), targetScore - entry.getValue())));
            }
        }
        gaps.sort(Comparator.comparingDouble(SkillGapItem::gap).reversed());

        int readiness = (int) Math.round((ratingSum / (ratings.size() * 5.0)) * 100);
        List<String> developmentPlan = buildDevelopmentPlan(gaps);

        return new SkillGapAnalysisResponse(
                snapshot.employeeId(),
                snapshot.employeeName(),
                snapshot.department(),
                targetScore,
                Math.min(readiness, 100),
                gaps.size(),
                gaps,
                developmentPlan);
    }
    private List<String> buildDevelopmentPlan(List<SkillGapItem> gaps) {
        if (gaps.isEmpty()) {
            return List.of(
                    "All tracked skills meet the target threshold — focus on stretch assignments and mentoring others");
        }
        List<String> plan = new ArrayList<>();
        gaps.stream().limit(3).forEach(gap -> plan.add(gap.recommendation()));
        if (gaps.size() > 3) {
            plan.add("Review remaining skill gaps in quarterly development planning");
        }
        return plan;
    }
    private static String trainingRecommendation(String skillCode, double gap) {
        String skill = humanizeSkill(skillCode);
        if (gap >= 1.5) {
            return "Enroll in an intensive " + skill + " bootcamp and assign a senior mentor for 60 days";
        }
        if (gap >= 1.0) {
            return "Assign structured " + skill + " training and monthly coaching checkpoints";
        }
        return "Provide targeted " + skill + " micro-learning and peer shadowing sessions";
    }

    static String humanizeSkill(String skillCode) {
        String normalized = skillCode.toLowerCase().replace('_', ' ');
        if (normalized.isEmpty()) {
            return skillCode;
        }
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }
    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
