package nexusHR.employee.dto;
import jakarta.validation.constraints.Size;
public record EmployeeProfileUpdateRequest(@Size(max = 32) String phone) {}
