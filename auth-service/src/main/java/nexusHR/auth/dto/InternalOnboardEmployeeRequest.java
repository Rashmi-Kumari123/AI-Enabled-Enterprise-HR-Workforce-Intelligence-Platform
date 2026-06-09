package nexusHR.auth.dto;
public record InternalOnboardEmployeeRequest(
        Long userId, String firstName, String lastName, String email, String phone, Long departmentId) {}
