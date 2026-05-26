package nexusHR.employee.repository;
import java.util.Optional;
import nexusHR.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByUserId(Long userId);
    boolean existsByEmail(String email);
}
