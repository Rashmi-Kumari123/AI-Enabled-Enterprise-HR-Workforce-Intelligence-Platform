package nexusHR.employee.dto;
import java.util.List;
public record EmployeeOnboardingPipelineResponse(
        Long id,
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        String departmentName,
        String employmentStatus,
        boolean onboardingCompleted,
        List<OnboardingTaskResponse> tasks) {}
