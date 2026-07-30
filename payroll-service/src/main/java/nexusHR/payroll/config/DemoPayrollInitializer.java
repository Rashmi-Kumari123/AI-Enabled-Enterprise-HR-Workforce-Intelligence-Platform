package nexusHR.payroll.config;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.common.tenant.TenantContext;
import nexusHR.payroll.dto.GeneratePayslipRequest;
import nexusHR.payroll.dto.SalaryStructureRequest;
import nexusHR.payroll.integration.EmployeeServiceClient;
import nexusHR.payroll.repository.PayslipRepository;
import nexusHR.payroll.repository.SalaryStructureRepository;
import nexusHR.payroll.service.PayrollService;
import nexusHR.payroll.service.SalaryStructureService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.payroll-seed-enabled", havingValue = "true", matchIfMissing = true)
public class DemoPayrollInitializer implements ApplicationRunner {
    private final EmployeeServiceClient employeeServiceClient;
    private final SalaryStructureService salaryStructureService;
    private final SalaryStructureRepository salaryStructureRepository;
    private final PayslipRepository payslipRepository;
    private final PayrollService payrollService;

    @Value("${app.demo.payroll-seed-enabled:true}")
    private boolean seedEnabled;

    @Value("${app.demo.tenant-id:1}")
    private long demoTenantId;

    private static final List<DemoSalary> DEFAULT_SALARIES = List.of(
            new DemoSalary(50_000, new BigDecimal("40"), new BigDecimal("2000"), new BigDecimal("1000")),
            new DemoSalary(45_000, new BigDecimal("40"), new BigDecimal("1500"), new BigDecimal("500")),
            new DemoSalary(60_000, new BigDecimal("40"), new BigDecimal("2500"), new BigDecimal("1500")),
            new DemoSalary(55_000, new BigDecimal("40"), new BigDecimal("2000"), new BigDecimal("1000")));

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            return;
        }
        TenantContext.setTenantId(demoTenantId);
        try {
            seedDemoPayroll();
        } finally {
            TenantContext.clear();
        }
    }

    private void seedDemoPayroll() {
        List<EmployeeServiceClient.EmployeeSnapshot> employees = employeeServiceClient.fetchActiveEmployees();
        if (employees.isEmpty()) {
            log.info("Demo payroll seed skipped: no active employees found");
            return;
        }
        YearMonth current = YearMonth.now();
        int seededStructures = 0;
        int seededPayslips = 0;
        for (int i = 0; i < employees.size(); i++) {
            EmployeeServiceClient.EmployeeSnapshot employee = employees.get(i);
            if (salaryStructureRepository.findByTenantIdAndEmployeeId(demoTenantId, employee.id()).isEmpty()) {
                DemoSalary salary = DEFAULT_SALARIES.get(i % DEFAULT_SALARIES.size());
                salaryStructureService.upsert(new SalaryStructureRequest(
                        employee.id(),
                        salary.base(),
                        salary.hraPercent(),
                        salary.transport(),
                        salary.other()));
                seededStructures++;
            }
            if (payslipRepository
                    .findByTenantIdAndEmployeeIdAndPayYearAndPayMonth(
                            demoTenantId, employee.id(), current.getYear(), current.getMonthValue())
                    .isEmpty()) {
                try {
                    payrollService.generatePayslip(
                            new GeneratePayslipRequest(
                                    employee.id(),
                                    employee.employeeCode(),
                                    employee.fullName(),
                                    current.getYear(),
                                    current.getMonthValue(),
                                    null,
                                    null),
                            "demo-seed");
                    seededPayslips++;
                } catch (Exception ex) {
                    log.warn("Demo payslip seed skipped for employee {}: {}", employee.id(), ex.getMessage());
                }
            }
        }
        if (seededStructures > 0 || seededPayslips > 0) {
            log.info("Demo payroll seed complete: {} salaries, {} payslips for {}", seededStructures, seededPayslips, current);
        }
    }
    private record DemoSalary(
            BigDecimal base, BigDecimal hraPercent, BigDecimal transport, BigDecimal other) {
        DemoSalary(int base, BigDecimal hraPercent, BigDecimal transport, BigDecimal other) {
            this(new BigDecimal(base), hraPercent, transport, other);
        }
    }
}
