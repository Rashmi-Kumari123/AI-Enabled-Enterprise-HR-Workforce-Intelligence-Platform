package nexusHR.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import nexusHR.common.enums.RoleName;

public record HireEmployeeRequest(
        @NotBlank @Size(max = 128) String firstName,
        @NotBlank @Size(max = 128) String lastName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String temporaryPassword,
        @Size(max = 32) String phone,
        Long departmentId,
        @NotNull LocalDate hireDate,
        String role) {
    public RoleName resolvedRole() {
        if (role == null || role.isBlank()) {
            return RoleName.ROLE_EMPLOYEE;
        }
        String normalized = role.trim().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        return RoleName.valueOf(normalized);
    }
}
