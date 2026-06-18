package nexusHR.performance.dto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import nexusHR.performance.enums.FeedbackType;
public record InviteFeedbackRequest(
        @NotNull FeedbackType feedbackType, @NotEmpty List<String> emails) {}
