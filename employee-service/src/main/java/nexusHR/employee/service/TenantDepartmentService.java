package nexusHR.employee.service;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.common.tenant.TenantContext;
import nexusHR.employee.entity.Department;
import nexusHR.employee.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class TenantDepartmentService {
    private static final List<String[]> DEFAULT_DEPARTMENTS = List.of(
            new String[] {"IT", "Information Technology", "Engineering and infrastructure"},
            new String[] {"HR", "Human Resources", "People operations"},
            new String[] {"FIN", "Finance", "Finance and accounting"},
            new String[] {"OPS", "Operations", "Business operations"});
    private final DepartmentRepository departmentRepository;

    @Transactional
    public void seedDepartmentsForTenant(Long tenantId) {
        for (String[] department : DEFAULT_DEPARTMENTS) {
            if (!departmentRepository.existsByTenantIdAndCode(tenantId, department[0])) {
                departmentRepository.save(new Department(tenantId, department[0], department[1], department[2]));
            }
        }
    }
    @Transactional(readOnly = true)
    public Long requireTenantId() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context is not set");
        }
        return tenantId;
    }
}
