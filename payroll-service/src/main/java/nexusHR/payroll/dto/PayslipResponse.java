package nexusHR.payroll.dto;
import java.math.BigDecimal;
import java.time.Instant;
import nexusHR.payroll.enums.PayslipStatus;
import nexusHR.payroll.entity.Payslip;

public record PayslipResponse(
        Long id,
        String payslipNumber,
        Long employeeId,
        String employeeCode,
        String employeeName,
        Integer payYear,
        Integer payMonth,
        Integer workingDays,
        Integer unpaidLeaveDays,
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
        String currency,
        PayslipStatus status,
        String generatedBy,
        Instant generatedAt) {

    public static PayslipResponse from(Payslip payslip) {
        return new PayslipResponse(
                payslip.getId(),
                payslip.getPayslipNumber(),
                payslip.getEmployeeId(),
                payslip.getEmployeeCode(),
                payslip.getEmployeeName(),
                payslip.getPayYear(),
                payslip.getPayMonth(),
                payslip.getWorkingDays(),
                payslip.getUnpaidLeaveDays(),
                payslip.getBaseSalary(),
                payslip.getHraAmount(),
                payslip.getTransportAllowance(),
                payslip.getOtherAllowance(),
                payslip.getGrossPay(),
                payslip.getPfDeduction(),
                payslip.getProfessionalTax(),
                payslip.getIncomeTax(),
                payslip.getLeaveDeduction(),
                payslip.getTotalDeductions(),
                payslip.getNetPay(),
                payslip.getCurrency(),
                payslip.getStatus(),
                payslip.getGeneratedBy(),
                payslip.getGeneratedAt());
    }
}
