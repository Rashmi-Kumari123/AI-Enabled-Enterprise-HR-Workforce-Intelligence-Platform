package nexusHR.payroll.service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import nexusHR.payroll.dto.PayrollCalculationResult;
import nexusHR.payroll.entity.SalaryStructure;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PayrollCalculator {
    private static final int MONEY_SCALE = 2;
    private final int defaultWorkingDays;
    private final BigDecimal pfRatePercent;
    private final BigDecimal pfMaxAmount;
    private final BigDecimal professionalTaxAmount;
    private final BigDecimal professionalTaxThreshold;
    private final BigDecimal incomeTaxRatePercent;
    public PayrollCalculator(
            @Value("${app.payroll.working-days-per-month}") int defaultWorkingDays,
            @Value("${app.payroll.pf-rate-percent}") BigDecimal pfRatePercent,
            @Value("${app.payroll.pf-max-amount}") BigDecimal pfMaxAmount,
            @Value("${app.payroll.professional-tax-amount}") BigDecimal professionalTaxAmount,
            @Value("${app.payroll.professional-tax-threshold}") BigDecimal professionalTaxThreshold,
            @Value("${app.payroll.income-tax-rate-percent}") BigDecimal incomeTaxRatePercent) {
        this.defaultWorkingDays = defaultWorkingDays;
        this.pfRatePercent = pfRatePercent;
        this.pfMaxAmount = pfMaxAmount;
        this.professionalTaxAmount = professionalTaxAmount;
        this.professionalTaxThreshold = professionalTaxThreshold;
        this.incomeTaxRatePercent = incomeTaxRatePercent;
    }
    public PayrollCalculationResult calculate(
            SalaryStructure structure, int workingDays, int unpaidLeaveDays) {
        int effectiveWorkingDays = workingDays > 0 ? workingDays : defaultWorkingDays;
        if (unpaidLeaveDays < 0) {
            throw new IllegalArgumentException("unpaidLeaveDays cannot be negative");
        }
        if (unpaidLeaveDays > effectiveWorkingDays) {
            throw new IllegalArgumentException("unpaidLeaveDays cannot exceed workingDays");
        }

        BigDecimal base = money(structure.getBaseSalary());
        BigDecimal hra = percentOf(base, structure.getHraPercent());
        BigDecimal transport = money(structure.getTransportAllowance());
        BigDecimal other = money(structure.getOtherAllowance());
        BigDecimal gross = base.add(hra).add(transport).add(other);

        BigDecimal pf = min(pfMaxAmount, percentOf(base, pfRatePercent));
        BigDecimal professionalTax =
                gross.compareTo(professionalTaxThreshold) >= 0 ? professionalTaxAmount : BigDecimal.ZERO;
        BigDecimal taxableIncome = gross.subtract(pf).max(BigDecimal.ZERO);
        BigDecimal incomeTax = percentOf(taxableIncome, incomeTaxRatePercent);

        BigDecimal perDayPay =
                gross.divide(BigDecimal.valueOf(effectiveWorkingDays), MONEY_SCALE, RoundingMode.HALF_UP);
        BigDecimal leaveDeduction = perDayPay.multiply(BigDecimal.valueOf(unpaidLeaveDays));

        BigDecimal totalDeductions = pf.add(professionalTax).add(incomeTax).add(leaveDeduction);
        BigDecimal net = gross.subtract(totalDeductions).max(BigDecimal.ZERO);
        return new PayrollCalculationResult(
                base,
                hra,
                transport,
                other,
                gross,
                pf,
                professionalTax,
                incomeTax,
                leaveDeduction,
                totalDeductions,
                net,
                structure.getCurrency());
    }
    private static BigDecimal percentOf(BigDecimal amount, BigDecimal percent) {
        return money(amount.multiply(percent).divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP));
    }
    private static BigDecimal min(BigDecimal left, BigDecimal right) {
        return left.compareTo(right) <= 0 ? left : right;
    }
    private static BigDecimal money(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
