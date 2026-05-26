package nexusHR.auth.repository;
import java.util.Optional;
import nexusHR.auth.entity.Role;
import nexusHR.common.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
    boolean existsByName(RoleName name);
}
