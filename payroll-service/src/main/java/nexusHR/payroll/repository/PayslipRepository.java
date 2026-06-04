package nexusHR.payroll.repository;
import java.util.List;
import java.util.Optional;
import nexusHR.payroll.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    Optional<Payslip> findByEmployeeIdAndPayYearAndPayMonth(Long employeeId, Integer payYear, Integer payMonth);
    List<Payslip> findByEmployeeIdOrderByPayYearDescPayMonthDesc(Long employeeId);
}
