package nexusHR.performance.dto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import nexusHR.performance.enums.RatingCriterion;
public record RatingItemRequest(
        @NotNull RatingCriterion criterion,
        @NotNull @Min(1) @Max(5) Integer score,
        String comment) {}
