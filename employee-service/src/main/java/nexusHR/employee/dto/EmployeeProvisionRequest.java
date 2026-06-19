package nexusHR.employee.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record EmployeeProvisionRequest(
        @NotBlank @Size(max = 128) String firstName, @NotBlank @Size(max = 128) String lastName) {}
