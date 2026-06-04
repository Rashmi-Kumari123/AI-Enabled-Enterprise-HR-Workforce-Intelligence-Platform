package nexusHR.performance.dto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
public record CreateReviewRequest(
        @NotNull Long employeeId,
        @NotNull @Min(2000) Integer reviewYear,
        @NotNull @Min(1) @Max(4) Integer reviewQuarter,
        String goals) {}
