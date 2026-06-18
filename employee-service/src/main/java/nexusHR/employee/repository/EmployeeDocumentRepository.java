package nexusHR.employee.repository;
import java.util.List;
import nexusHR.employee.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {
    List<EmployeeDocument> findByEmployeeIdOrderByUploadedAtDesc(Long employeeId);
}
