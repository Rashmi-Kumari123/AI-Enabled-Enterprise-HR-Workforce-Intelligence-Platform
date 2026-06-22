package nexusHR.auth.dto;
public record InternalOnboardEmployeeRequest(
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
