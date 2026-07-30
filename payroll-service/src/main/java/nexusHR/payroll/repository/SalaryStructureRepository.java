package nexusHR.payroll.repository;
import java.util.List;
import java.util.Optional;
import nexusHR.payroll.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    Optional<SalaryStructure> findByTenantIdAndEmployeeId(Long tenantId, Long employeeId);

    List<SalaryStructure> findByTenantId(Long tenantId);
}
