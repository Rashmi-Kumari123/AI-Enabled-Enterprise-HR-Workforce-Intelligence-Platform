package nexusHR.insights.service;
import java.util.ArrayList;
import java.util.List;
import nexusHR.insights.dto.EmployeeWorkforceSnapshot;
import nexusHR.insights.dto.EngagementScoreResponse;
import nexusHR.insights.enums.EngagementLevel;
import org.springframework.stereotype.Service;

@Service
public class EngagementScorer {
    public EngagementScoreResponse assess(EmployeeWorkforceSnapshot snapshot) {
        List<String> factors = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        int score = 0;

        int totalDays = snapshot.presentDaysLast30() + snapshot.absentDaysLast30();
        double attendanceRate = totalDays == 0 ? 0.85 : (double) snapshot.presentDaysLast30() / totalDays;
        int attendancePoints = (int) Math.round(attendanceRate * 40);
        score += attendancePoints;
        factors.add(String.format("Attendance engagement: %.0f%% over last 30 days", attendanceRate * 100));
        if (attendanceRate < 0.85) {
            recommendations.add("Review attendance patterns and address recurring absences with the employee");
        }

        int performancePoints;
        if (snapshot.averagePerformanceRating() != null) {
            performancePoints = (int) Math.round((snapshot.averagePerformanceRating() / 5.0) * 35);
            factors.add(String.format(
                    "Performance contribution: %.2f/5 average across %d review(s)",
                    snapshot.averagePerformanceRating(),
                    snapshot.totalReviews()));
            if (snapshot.averagePerformanceRating() < 3.5) {
                recommendations.add("Increase feedback frequency and set clear quarterly goals");
            }
        } else {
            performancePoints = 18;
            factors.add("Performance contribution: neutral baseline (no reviews yet)");
            recommendations.add("Schedule an initial performance review to establish engagement baseline");
        }
        score += performancePoints;

        int leavePoints = 15;
        if (snapshot.approvedLeaveDaysLast12Months() > 25) {
            leavePoints -= 8;
            factors.add("Leave utilization is high in the last 12 months");
            recommendations.add("Discuss workload balance and leave planning with the employee");
        } else {
            factors.add("Leave utilization is within a healthy range");
        }
        if (snapshot.pendingLeaveRequests() > 1) {
            leavePoints -= 4;
            factors.add("Multiple pending leave requests may signal disengagement or overload");
        }
        score += Math.max(leavePoints, 0);

        int tenurePoints = 5;
        if (snapshot.tenureMonths() >= 6 && snapshot.tenureMonths() <= 48) {
            tenurePoints = 10;
            factors.add("Tenure stability contributes positively to engagement");
        } else if (snapshot.tenureMonths() < 3) {
            tenurePoints = 3;
            factors.add("Early tenure — onboarding engagement is still forming");
            recommendations.add("Strengthen onboarding check-ins during the first 90 days");
        } else {
            factors.add("Tenure profile considered in engagement scoring");
        }
        score += tenurePoints;

        if (!"ACTIVE".equalsIgnoreCase(snapshot.employmentStatus())) {
            score = Math.min(score, 20);
            factors.add("Non-active employment status significantly lowers engagement score");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Maintain recognition, growth conversations, and team connection rituals");
            recommendations.add("Continue monitoring attendance and performance trends monthly");
        }
        int capped = Math.min(Math.max(score, 0), 100);
        return new EngagementScoreResponse(
                snapshot.employeeId(),
                snapshot.employeeName(),
                snapshot.department(),
                capped,
                EngagementLevel.fromScore(capped),
                factors,
                recommendations);
    }
}
