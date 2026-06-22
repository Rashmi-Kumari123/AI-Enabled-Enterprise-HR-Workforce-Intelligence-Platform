package nexusHR.employee.repository;
import java.util.List;
import java.util.Optional;
import nexusHR.employee.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByCode(String code);
    Optional<Department> findByTenantIdAndCode(Long tenantId, String code);
    List<Department> findAllByTenantId(Long tenantId);
    boolean existsByTenantIdAndCode(Long tenantId, String code);
}
