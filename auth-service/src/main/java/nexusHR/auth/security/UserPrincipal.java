package nexusHR.auth.security;
import java.util.Collection;
import java.util.stream.Collectors;
import lombok.Getter;
import nexusHR.auth.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String email;
    private final String password;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;
    public UserPrincipal(
            Long id,
            String email,
            String password,
            boolean enabled,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
    }
    public static UserPrincipal from(User user) {
        Collection<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toSet());
        return new UserPrincipal(
                user.getId(), user.getEmail(), user.getPassword(), user.isEnabled(), authorities);
    }
    @Override
    public String getUsername() {
        return email;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
