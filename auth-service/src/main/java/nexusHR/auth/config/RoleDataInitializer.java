package nexusHR.auth.config;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.entity.Role;
import nexusHR.auth.repository.RoleRepository;
import nexusHR.common.enums.RoleName;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleDataInitializer implements ApplicationRunner {
    private final RoleRepository roleRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedRole(RoleName.ROLE_ADMIN, "Platform administrator");
        seedRole(RoleName.ROLE_HR, "Human resources staff");
        seedRole(RoleName.ROLE_MANAGER, "Team manager");
        seedRole(RoleName.ROLE_EMPLOYEE, "Standard employee");
    }
    private void seedRole(RoleName name, String description) {
        if (!roleRepository.existsByName(name)) {
            roleRepository.save(new Role(name, description));
        }
    }
}
