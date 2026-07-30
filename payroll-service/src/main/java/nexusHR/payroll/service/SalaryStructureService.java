package nexusHR.payroll.service;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.payroll.dto.SalaryStructureRequest;
import nexusHR.payroll.dto.SalaryStructureResponse;
import nexusHR.payroll.entity.SalaryStructure;
import nexusHR.payroll.exception.ApiException;
import nexusHR.payroll.repository.SalaryStructureRepository;
import nexusHR.common.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SalaryStructureService {
    private final SalaryStructureRepository salaryStructureRepository;
    @Transactional
    public SalaryStructureResponse upsert(SalaryStructureRequest request) {
        Long tenantId = TenantContext.requireTenantId();
        SalaryStructure structure = salaryStructureRepository
                .findByTenantIdAndEmployeeId(tenantId, request.employeeId())
                .orElseGet(SalaryStructure::new);
        structure.setTenantId(tenantId);
        structure.setEmployeeId(request.employeeId());
        structure.setBaseSalary(request.baseSalary());
        structure.setHraPercent(defaultPercent(request.hraPercent(), new BigDecimal("40.00")));
        structure.setTransportAllowance(defaultAmount(request.transportAllowance()));
        structure.setOtherAllowance(defaultAmount(request.otherAllowance()));
        return SalaryStructureResponse.from(salaryStructureRepository.save(structure));
    }
    @Transactional(readOnly = true)
    public SalaryStructureResponse findByEmployeeId(Long employeeId) {
        return salaryStructureRepository
                .findByTenantIdAndEmployeeId(TenantContext.requireTenantId(), employeeId)
                .map(SalaryStructureResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Salary structure not found for employee"));
    }
    @Transactional(readOnly = true)
    public List<SalaryStructureResponse> findAll() {
        return salaryStructureRepository.findByTenantId(TenantContext.requireTenantId()).stream()
                .map(SalaryStructureResponse::from)
                .toList();
    }
    private static BigDecimal defaultPercent(BigDecimal value, BigDecimal fallback) {
        return value != null ? value : fallback;
    }
    private static BigDecimal defaultAmount(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
