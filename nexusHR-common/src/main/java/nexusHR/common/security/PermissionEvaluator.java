package nexusHR.common.security;

import java.util.Collection;
import java.util.EnumSet;
import java.util.Set;
import nexusHR.common.enums.RoleName;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class PermissionEvaluator {
    public boolean hasModule(Authentication authentication, AppModule module) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        Set<RoleName> roles = resolveRoles(authentication.getAuthorities());
        return RolePermissions.canAccessAny(roles, module);
    }

    public static Set<RoleName> resolveRoles(Collection<? extends GrantedAuthority> authorities) {
        EnumSet<RoleName> roles = EnumSet.noneOf(RoleName.class);
        for (GrantedAuthority authority : authorities) {
            String name = authority.getAuthority();
            if (name.startsWith("ROLE_")) {
                try {
                    roles.add(RoleName.valueOf(name));
                } catch (IllegalArgumentException ignored) {
                    // unknown role
                }
            }
        }
        return roles;
    }
}
