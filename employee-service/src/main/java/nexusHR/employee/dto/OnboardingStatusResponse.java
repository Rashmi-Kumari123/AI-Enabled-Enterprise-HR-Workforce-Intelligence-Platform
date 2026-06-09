package nexusHR.employee.dto;
import java.util.List;
public record OnboardingStatusResponse(
        Long employeeId, boolean onboardingCompleted, List<OnboardingTaskResponse> tasks) {}
