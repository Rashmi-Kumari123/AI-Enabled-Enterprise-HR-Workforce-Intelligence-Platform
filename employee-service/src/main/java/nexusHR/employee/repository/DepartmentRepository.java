package nexusHR.employee.repository;
import java.util.Optional;
import nexusHR.employee.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByCode(String code);
}
