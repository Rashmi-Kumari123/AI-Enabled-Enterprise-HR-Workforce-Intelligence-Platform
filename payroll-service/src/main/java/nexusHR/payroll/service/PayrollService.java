package nexusHR.payroll.service;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.payroll.enums.PayslipStatus;
import nexusHR.payroll.dto.GeneratePayslipRequest;
import nexusHR.payroll.dto.NotificationDispatchPayload;
import nexusHR.payroll.dto.PayrollCalculationResult;
import nexusHR.payroll.dto.PayslipResponse;
import nexusHR.payroll.entity.Payslip;
import nexusHR.payroll.entity.SalaryStructure;
import nexusHR.payroll.exception.ApiException;
import nexusHR.payroll.integration.EmployeeServiceClient;
import nexusHR.payroll.integration.LeaveServiceClient;
import nexusHR.payroll.integration.NotificationClient;
import nexusHR.payroll.repository.PayslipRepository;
import nexusHR.payroll.repository.SalaryStructureRepository;
import nexusHR.common.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PayrollService {
    private final SalaryStructureRepository salaryStructureRepository;
    private final PayslipRepository payslipRepository;
    private final PayrollCalculator payrollCalculator;
    private final PayslipPdfGenerator payslipPdfGenerator;
    private final LeaveServiceClient leaveServiceClient;
    private final EmployeeServiceClient employeeServiceClient;
    private final NotificationClient notificationClient;

    @Value("${app.payroll.working-days-per-month}")
    private int defaultWorkingDays;

    @Transactional
    public PayslipResponse generatePayslip(GeneratePayslipRequest request, String generatedBy) {
        Long tenantId = TenantContext.requireTenantId();
        if (payslipRepository
                .findByTenantIdAndEmployeeIdAndPayYearAndPayMonth(
                        tenantId, request.employeeId(), request.payYear(), request.payMonth())
                .isPresent()) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Payslip already exists for employee "
                            + request.employeeId()
                            + " in "
                            + request.payYear()
                            + "-"
                            + request.payMonth());
        }

        SalaryStructure structure = salaryStructureRepository
                .findByTenantIdAndEmployeeId(tenantId, request.employeeId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND, "Salary structure not found. Configure salary before generating payslip."));

        int workingDays = request.workingDays() != null ? request.workingDays() : defaultWorkingDays;
        int unpaidLeaveDays = request.unpaidLeaveDays() != null
                ? request.unpaidLeaveDays()
                : leaveServiceClient.fetchUnpaidLeaveDays(
                        request.employeeId(), request.payYear(), request.payMonth());

        PayrollCalculationResult calculation;
        try {
            calculation = payrollCalculator.calculate(structure, workingDays, unpaidLeaveDays);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        Payslip payslip = new Payslip();
        payslip.setTenantId(tenantId);
        payslip.setPayslipNumber(buildPayslipNumber(request));
        payslip.setEmployeeId(request.employeeId());
        payslip.setEmployeeCode(request.employeeCode());
        payslip.setEmployeeName(request.employeeName());
        payslip.setPayYear(request.payYear());
        payslip.setPayMonth(request.payMonth());
        payslip.setWorkingDays(workingDays);
        payslip.setUnpaidLeaveDays(unpaidLeaveDays);
        applyCalculation(payslip, calculation);
        payslip.setGeneratedBy(generatedBy);
        payslip.setStatus(PayslipStatus.GENERATED);

        Payslip saved = payslipRepository.save(payslip);
        notifyPayslipReady(saved);
        return PayslipResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PayslipResponse findById(Long id) {
        return payslipRepository
                .findByIdAndTenantId(id, TenantContext.requireTenantId())
                .map(PayslipResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payslip not found"));
    }

    @Transactional(readOnly = true)
    public List<PayslipResponse> findByEmployee(Long employeeId) {
        return payslipRepository
                .findByTenantIdAndEmployeeIdOrderByPayYearDescPayMonthDesc(
                        TenantContext.requireTenantId(), employeeId)
                .stream()
                .map(PayslipResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public byte[] downloadPayslipPdf(Long id) {
        Payslip payslip = payslipRepository
                .findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payslip not found"));
        return payslipPdfGenerator.generate(payslip);
    }

    @Transactional
    public PayslipResponse markPaid(Long id) {
        Payslip payslip = payslipRepository
                .findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payslip not found"));
        payslip.setStatus(PayslipStatus.PAID);
        Payslip saved = payslipRepository.save(payslip);
        notifyPayslipPaid(saved);
        return PayslipResponse.from(saved);
    }

    private void notifyPayslipReady(Payslip payslip) {
        var employee = employeeServiceClient.fetchEmployee(payslip.getEmployeeId());
        if (employee == null || employee.email() == null) {
            return;
        }
        String period = formatPeriod(payslip.getPayYear(), payslip.getPayMonth());
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                employee.email(),
                "Payslip ready",
                "Your payslip for " + period + " is ready. Net pay: " + payslip.getNetPay() + " " + payslip.getCurrency(),
                "PAYROLL_READY",
                "PAYSLIP",
                payslip.getId()));
    }

    private void notifyPayslipPaid(Payslip payslip) {
        var employee = employeeServiceClient.fetchEmployee(payslip.getEmployeeId());
        if (employee == null || employee.email() == null) {
            return;
        }
        String period = formatPeriod(payslip.getPayYear(), payslip.getPayMonth());
        notificationClient.dispatch(new NotificationDispatchPayload(
                "USER",
                employee.email(),
                "Salary credited",
                "Your salary for " + period + " has been marked as paid.",
                "PAYROLL_READY",
                "PAYSLIP",
                payslip.getId()));
    }

    private static String formatPeriod(int year, int month) {
        return YearMonth.of(year, month).format(DateTimeFormatter.ofPattern("MMMM yyyy"));
    }
    private static void applyCalculation(Payslip payslip, PayrollCalculationResult calculation) {
        payslip.setBaseSalary(calculation.baseSalary());
        payslip.setHraAmount(calculation.hraAmount());
        payslip.setTransportAllowance(calculation.transportAllowance());
        payslip.setOtherAllowance(calculation.otherAllowance());
        payslip.setGrossPay(calculation.grossPay());
        payslip.setPfDeduction(calculation.pfDeduction());
        payslip.setProfessionalTax(calculation.professionalTax());
        payslip.setIncomeTax(calculation.incomeTax());
        payslip.setLeaveDeduction(calculation.leaveDeduction());
        payslip.setTotalDeductions(calculation.totalDeductions());
        payslip.setNetPay(calculation.netPay());
        payslip.setCurrency(calculation.currency());
    }
    private static String buildPayslipNumber(GeneratePayslipRequest request) {
        YearMonth period = YearMonth.of(request.payYear(), request.payMonth());
        String periodPart = period.format(DateTimeFormatter.ofPattern("yyyyMM"));
        return "PS-" + periodPart + "-" + request.employeeId();
    }
}
