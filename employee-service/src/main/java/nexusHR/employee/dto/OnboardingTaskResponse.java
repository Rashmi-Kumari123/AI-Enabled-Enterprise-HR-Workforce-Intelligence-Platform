package nexusHR.employee.dto;
import java.time.Instant;
import java.util.List;
public record OnboardingTaskResponse(Long id, String taskCode, String title, boolean completed, Instant completedAt) {}
