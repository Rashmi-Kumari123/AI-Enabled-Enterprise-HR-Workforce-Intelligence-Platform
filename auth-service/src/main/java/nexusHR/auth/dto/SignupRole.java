package nexusHR.auth.dto;
import nexusHR.common.enums.RoleName;
public enum SignupRole {
    EMPLOYEE(RoleName.ROLE_EMPLOYEE),
    MANAGER(RoleName.ROLE_MANAGER),
    HR(RoleName.ROLE_HR),
    ADMIN(RoleName.ROLE_ADMIN);
    private final RoleName roleName;
    SignupRole(RoleName roleName) {
        this.roleName = roleName;
    }
    public RoleName toRoleName() {
        return roleName;
    }
}
