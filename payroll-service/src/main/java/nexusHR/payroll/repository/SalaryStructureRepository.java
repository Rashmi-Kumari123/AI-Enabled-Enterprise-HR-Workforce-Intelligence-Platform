package nexusHR.payroll.repository;
import java.util.Optional;
import nexusHR.payroll.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    Optional<SalaryStructure> findByEmployeeId(Long employeeId);
}
