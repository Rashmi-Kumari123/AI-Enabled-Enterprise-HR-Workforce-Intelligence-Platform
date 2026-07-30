package nexusHR.auth.repository;
import java.util.Optional;
import nexusHR.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByTenantIdAndEmail(Long tenantId, String email);
    boolean existsByEmail(String email);
    boolean existsByTenantIdAndEmail(Long tenantId, String email);
    long countByTenantId(Long tenantId);
    java.util.List<User> findAllByTenantId(Long tenantId);
}
