package nexusHR.employee.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import nexusHR.common.enums.EmploymentStatus;

public record EmployeeRequest(
        @NotNull Long userId,
        @NotBlank @Size(max = 32) String employeeCode,
        @NotBlank @Size(max = 128) String firstName,
        @NotBlank @Size(max = 128) String lastName,
        @NotBlank @Email String email,
        @Size(max = 32) String phone,
        Long departmentId,
        @NotNull LocalDate hireDate,
        EmploymentStatus employmentStatus) {}
