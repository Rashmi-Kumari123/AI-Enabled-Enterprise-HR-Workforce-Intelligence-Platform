package nexusHR.insights.service;
import java.util.ArrayList;
import java.util.List;
import nexusHR.insights.dto.AttritionRiskAssessment;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.enums.RiskLevel;
import org.springframework.stereotype.Service;

@Service
public class AttritionRiskScorer {
    public AttritionRiskAssessment assess(EmployeeWorkforceSnapshot snapshot) {
        int score = 0;
        List<String> factors = new ArrayList<>();

        if (!"ACTIVE".equalsIgnoreCase(snapshot.employmentStatus())) {
            score += 40;
            factors.add("Employment status is " + snapshot.employmentStatus());
        }
        if (snapshot.tenureMonths() < 6) {
            score += 15;
            factors.add("Early tenure window (< 6 months) increases turnover risk");
        } else if (snapshot.tenureMonths() >= 24 && snapshot.tenureMonths() <= 36) {
            score += 10;
            factors.add("2–3 year tenure band often correlates with career moves");
        }
        if (snapshot.averagePerformanceRating() != null) {
            if (snapshot.averagePerformanceRating() < 2.5) {
                score += 30;
                factors.add("Low performance rating (" + snapshot.averagePerformanceRating() + "/5)");
            } else if (snapshot.averagePerformanceRating() < 3.5) {
                score += 15;
                factors.add("Below-target performance rating (" + snapshot.averagePerformanceRating() + "/5)");
            }
        } else if (snapshot.totalReviews() == 0) {
            score += 8;
            factors.add("No performance reviews on record");
        }
        if (snapshot.approvedLeaveDaysLast12Months() >= 20) {
            score += 12;
            factors.add("High approved leave days in last 12 months");
        }
        if (snapshot.pendingLeaveRequests() > 0) {
            score += 8;
            factors.add(snapshot.pendingLeaveRequests() + " pending leave request(s)");
        }
        if (snapshot.absentDaysLast30() >= 4) {
            score += 20;
            factors.add("Elevated absent days in last 30 days (" + snapshot.absentDaysLast30() + ")");
        }
        int totalDays = snapshot.presentDaysLast30() + snapshot.absentDaysLast30();
        if (totalDays > 0) {
            double absentRate = (double) snapshot.absentDaysLast30() / totalDays;
            if (absentRate >= 0.2) {
                score += 10;
                factors.add("Absenteeism rate above 20% in last 30 days");
            }
        }
        if (factors.isEmpty()) {
            factors.add("Workforce signals are within normal ranges");
        }
        int capped = Math.min(score, 100);
        return new AttritionRiskAssessment(capped, RiskLevel.fromScore(capped), factors);
    }
}
