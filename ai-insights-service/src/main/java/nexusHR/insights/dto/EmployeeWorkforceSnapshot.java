package nexusHR.insights.dto;
import java.time.LocalDate;
import java.util.Map;
public record EmployeeWorkforceSnapshot(
        Long employeeId,
        String employeeName,
        String department,
        LocalDate hireDate,
        int tenureMonths,
        String employmentStatus,
        Double averagePerformanceRating,
        int totalReviews,
        int approvedLeaveDaysLast12Months,
        int pendingLeaveRequests,
        int absentDaysLast30,
        int presentDaysLast30,
        Map<String, Double> skillRatingsByCriterion) {

    public static EmployeeWorkforceSnapshot fromRequest(AttritionPredictRequest request) {
        return new EmployeeWorkforceSnapshot(
                request.employeeId(),
                request.employeeName(),
                request.department(),
                null,
                request.tenureMonths(),
                request.employmentStatus(),
                request.averagePerformanceRating(),
                request.totalReviews(),
                request.approvedLeaveDaysLast12Months(),
                request.pendingLeaveRequests(),
                request.absentDaysLast30(),
                request.presentDaysLast30(),
                request.skillRatingsByCriterion() != null ? request.skillRatingsByCriterion() : Map.of());
    }
}
