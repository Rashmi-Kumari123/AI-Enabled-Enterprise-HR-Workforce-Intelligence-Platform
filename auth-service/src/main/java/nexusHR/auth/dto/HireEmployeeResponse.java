package nexusHR.auth.dto;
public record HireEmployeeResponse(
        Long userId,
        Long employeeId,
        String employeeCode,
        String email,
        String firstName,
        String lastName,
        String message) {}
