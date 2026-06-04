package nexusHR.payroll.dto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record GeneratePayslipRequest(
        @NotNull Long employeeId,
        @NotBlank String employeeCode,
        @NotBlank String employeeName,
        @NotNull @Min(2000) Integer payYear,
        @NotNull @Min(1) @Max(12) Integer payMonth,
        @Min(1) Integer workingDays,
        @Min(0) Integer unpaidLeaveDays) {}
