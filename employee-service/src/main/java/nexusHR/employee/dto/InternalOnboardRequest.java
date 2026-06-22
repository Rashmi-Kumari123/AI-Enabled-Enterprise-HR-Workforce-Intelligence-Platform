package nexusHR.employee.dto;
public record InternalOnboardRequest(
        Long tenantId,
        Long userId,
        String firstName,
        String lastName,
        String email,
        String phone,
        Long departmentId,
        String departmentCode,
        java.time.LocalDate hireDate,
        Boolean skipOnboarding) {}
