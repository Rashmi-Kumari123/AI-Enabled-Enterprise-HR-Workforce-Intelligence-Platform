package nexusHR.employee.repository;
import java.util.List;
import nexusHR.employee.entity.OnboardingTask;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, Long> {
    List<OnboardingTask> findByEmployeeIdOrderByCreatedAtAsc(Long employeeId);
    long countByEmployeeIdAndCompletedFalse(Long employeeId);
}
