package nexusHR.auth.dto;

import nexusHR.common.enums.RoleName;

public enum SignupRole {
    MANAGER(RoleName.ROLE_MANAGER),
    HR(RoleName.ROLE_HR),
    PAYROLL(RoleName.ROLE_PAYROLL),
    IT_ADMIN(RoleName.ROLE_IT_ADMIN),
    ADMIN(RoleName.ROLE_SUPER_ADMIN);

    private final RoleName roleName;

    SignupRole(RoleName roleName) {
        this.roleName = roleName;
    }

    public RoleName toRoleName() {
        return roleName;
    }
}
