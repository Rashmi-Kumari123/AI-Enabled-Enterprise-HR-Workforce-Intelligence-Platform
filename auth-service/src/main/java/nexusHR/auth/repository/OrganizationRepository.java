package nexusHR.auth.repository;
import java.util.Optional;
import nexusHR.auth.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findBySlugIgnoreCase(String slug);
    boolean existsBySlugIgnoreCase(String slug);
}
