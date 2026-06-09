package nexusHR.employee.dto;
public record InternalOnboardRequest(
        Long userId, String firstName, String lastName, String email, String phone, Long departmentId) {}
