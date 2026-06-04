package nexusHR.payroll.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
public record SalaryStructureRequest(
        @NotNull Long employeeId,
        @NotNull @DecimalMin("0.01") BigDecimal baseSalary,
        @DecimalMin("0") BigDecimal hraPercent,
        @DecimalMin("0") BigDecimal transportAllowance,
        @DecimalMin("0") BigDecimal otherAllowance) {}
