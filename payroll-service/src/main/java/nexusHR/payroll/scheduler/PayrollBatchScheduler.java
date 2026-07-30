package nexusHR.payroll.scheduler;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.common.tenant.TenantContext;
import nexusHR.payroll.dto.GeneratePayslipRequest;
import nexusHR.payroll.entity.SalaryStructure;
import nexusHR.payroll.integration.EmployeeServiceClient;
import nexusHR.payroll.integration.LeaveServiceClient;
import nexusHR.payroll.repository.SalaryStructureRepository;
import nexusHR.payroll.service.PayrollService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PayrollBatchScheduler {
    private final SalaryStructureRepository salaryStructureRepository;
    private final PayrollService payrollService;
    private final EmployeeServiceClient employeeServiceClient;
    private final LeaveServiceClient leaveServiceClient;

    @Value("${app.payroll.batch.enabled:true}")
    private boolean batchEnabled;

    @Scheduled(cron = "${app.payroll.batch.cron:0 0 6 1 * *}")
    public void runMonthlyPayroll() {
        if (!batchEnabled) {
            return;
        }
        YearMonth previous = YearMonth.now().minusMonths(1);
        Map<Long, List<SalaryStructure>> structuresByTenant = salaryStructureRepository.findAll().stream()
                .collect(Collectors.groupingBy(SalaryStructure::getTenantId));
        log.info(
                "Starting automated payroll for {} ({} employees across {} tenants)",
                previous,
                structuresByTenant.values().stream().mapToInt(List::size).sum(),
                structuresByTenant.size());

        for (Map.Entry<Long, List<SalaryStructure>> entry : structuresByTenant.entrySet()) {
            TenantContext.setTenantId(entry.getKey());
            try {
                for (SalaryStructure structure : entry.getValue()) {
                    processStructure(structure, previous);
                }
            } finally {
                TenantContext.clear();
            }
        }
    }

    private void processStructure(SalaryStructure structure, YearMonth previous) {
        try {
            var employee = employeeServiceClient.fetchEmployee(structure.getEmployeeId());
            if (employee == null || "TERMINATED".equals(employee.employmentStatus())) {
                return;
            }
            int unpaidLeaveDays = leaveServiceClient.fetchUnpaidLeaveDays(
                    structure.getEmployeeId(), previous.getYear(), previous.getMonthValue());
            payrollService.generatePayslip(
                    new GeneratePayslipRequest(
                            structure.getEmployeeId(),
                            employee.employeeCode(),
                            employee.fullName(),
                            previous.getYear(),
                            previous.getMonthValue(),
                            null,
                            unpaidLeaveDays),
                    "payroll-batch");
        } catch (Exception ex) {
            log.warn(
                    "Automated payroll skipped/failed for employee {}: {}",
                    structure.getEmployeeId(),
                    ex.getMessage());
        }
    }
}
