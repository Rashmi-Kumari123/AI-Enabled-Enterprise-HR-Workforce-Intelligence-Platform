package nexusHR.employee.repository;
import java.util.List;
import java.util.Optional;
import nexusHR.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByUserId(Long userId);
    Optional<Employee> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Employee> findByOnboardingCompletedFalseOrderByCreatedAtDesc();
}
