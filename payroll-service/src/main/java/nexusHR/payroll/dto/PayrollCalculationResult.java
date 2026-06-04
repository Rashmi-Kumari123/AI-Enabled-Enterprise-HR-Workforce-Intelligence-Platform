package nexusHR.payroll.dto;
import java.math.BigDecimal;
public record PayrollCalculationResult(
        BigDecimal baseSalary,
        BigDecimal hraAmount,
        BigDecimal transportAllowance,
        BigDecimal otherAllowance,
        BigDecimal grossPay,
        BigDecimal pfDeduction,
        BigDecimal professionalTax,
        BigDecimal incomeTax,
        BigDecimal leaveDeduction,
        BigDecimal totalDeductions,
        BigDecimal netPay,
        String currency) {}
