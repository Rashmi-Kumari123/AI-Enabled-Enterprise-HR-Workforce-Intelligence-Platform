package nexusHR.payroll.service;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import java.math.BigDecimal;
import nexusHR.payroll.dto.PayrollCalculationResult;
import nexusHR.payroll.entity.SalaryStructure;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PayrollCalculatorTest {
    private PayrollCalculator calculator;
    @BeforeEach
    void setUp() {
        calculator = new PayrollCalculator(22, new BigDecimal("12"), new BigDecimal("1800"), new BigDecimal("200"), new BigDecimal("15000"), new BigDecimal("10"));
    }
    @Test
    void calculatesGrossDeductionsAndNetWithoutLeave() {
        SalaryStructure structure = new SalaryStructure();
        structure.setBaseSalary(new BigDecimal("50000.00"));
        structure.setHraPercent(new BigDecimal("40.00"));
        structure.setTransportAllowance(new BigDecimal("2000.00"));
        structure.setOtherAllowance(new BigDecimal("1000.00"));
        structure.setCurrency("INR");

        PayrollCalculationResult result = calculator.calculate(structure, 22, 0);

        assertThat(result.grossPay()).isEqualByComparingTo("73000.00");
        assertThat(result.hraAmount()).isEqualByComparingTo("20000.00");
        assertThat(result.pfDeduction()).isEqualByComparingTo("1800.00");
        assertThat(result.professionalTax()).isEqualByComparingTo("200.00");
        assertThat(result.incomeTax()).isEqualByComparingTo("7120.00");
        assertThat(result.leaveDeduction()).isEqualByComparingTo("0.00");
        assertThat(result.netPay()).isEqualByComparingTo("63880.00");
    }
    @Test
    void deductsUnpaidLeaveFromNetPay() {
        SalaryStructure structure = new SalaryStructure();
        structure.setBaseSalary(new BigDecimal("44000.00"));
        structure.setHraPercent(new BigDecimal("40.00"));
        structure.setTransportAllowance(BigDecimal.ZERO);
        structure.setOtherAllowance(BigDecimal.ZERO);
        structure.setCurrency("INR");

        PayrollCalculationResult withLeave = calculator.calculate(structure, 22, 2);
        PayrollCalculationResult withoutLeave = calculator.calculate(structure, 22, 0);

        assertThat(withLeave.leaveDeduction()).isEqualByComparingTo("5600.00");
        assertThat(withLeave.netPay()).isLessThan(withoutLeave.netPay());
    }
    @Test
    void rejectsUnpaidLeaveGreaterThanWorkingDays() {
        SalaryStructure structure = new SalaryStructure();
        structure.setBaseSalary(new BigDecimal("30000.00"));
        structure.setHraPercent(new BigDecimal("40.00"));

        assertThatThrownBy(() -> calculator.calculate(structure, 22, 25))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("unpaidLeaveDays");
    }
}
