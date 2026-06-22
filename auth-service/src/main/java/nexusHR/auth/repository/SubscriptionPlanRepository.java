package nexusHR.auth.repository;
import java.util.Optional;
import nexusHR.auth.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findByCode(String code);
}
