package nexusHR.insights.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
public record AttritionPredictRequest(
        @NotNull Long employeeId,
        @NotBlank String employeeName,
        String department,
        @Min(0) int tenureMonths,
        @NotBlank String employmentStatus,
        Double averagePerformanceRating,
        @Min(0) int totalReviews,
        @Min(0) int approvedLeaveDaysLast12Months,
        @Min(0) int pendingLeaveRequests,
        @Min(0) int absentDaysLast30,
        @Min(0) int presentDaysLast30,
        Map<String, Double> skillRatingsByCriterion) {}
