package nexusHR.payroll.dto;
import java.math.BigDecimal;
import java.time.Instant;
import nexusHR.payroll.entity.SalaryStructure;

public record SalaryStructureResponse(
        Long id,
        Long employeeId,
        BigDecimal baseSalary,
        BigDecimal hraPercent,
        BigDecimal transportAllowance,
        BigDecimal otherAllowance,
        String currency,
        Instant updatedAt) {

    public static SalaryStructureResponse from(SalaryStructure structure) {
        return new SalaryStructureResponse(
                structure.getId(),
                structure.getEmployeeId(),
                structure.getBaseSalary(),
                structure.getHraPercent(),
                structure.getTransportAllowance(),
                structure.getOtherAllowance(),
                structure.getCurrency(),
                structure.getUpdatedAt());
    }
}
