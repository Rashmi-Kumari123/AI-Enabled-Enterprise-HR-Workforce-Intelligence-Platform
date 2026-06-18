package nexusHR.employee.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import nexusHR.common.enums.EmploymentStatus;
public record EmployeeResponse(
        Long id,
        Long userId,
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        String phone,
        Long departmentId,
        String departmentName,
        LocalDate hireDate,
        EmploymentStatus employmentStatus,
        boolean onboardingCompleted,
        Instant createdAt,
        Instant updatedAt) {}
