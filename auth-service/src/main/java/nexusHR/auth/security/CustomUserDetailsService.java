package nexusHR.auth.security;
import lombok.RequiredArgsConstructor;
import nexusHR.common.tenant.TenantContext;
import nexusHR.auth.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return userRepository
                    .findByTenantIdAndEmail(tenantId, username.toLowerCase().trim())
                    .map(UserPrincipal::from)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        }
        return userRepository
                .findByEmail(username)
                .map(UserPrincipal::from)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
