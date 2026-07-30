package nexusHR.common.security;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import nexusHR.common.enums.RoleName;

public final class RolePermissions {
    private static final Map<RoleName, Set<AppModule>> ACCESS = new EnumMap<>(RoleName.class);

    static {
        ACCESS.put(RoleName.ROLE_PLATFORM_ADMIN, EnumSet.allOf(AppModule.class));
        ACCESS.put(RoleName.ROLE_SUPER_ADMIN, EnumSet.allOf(AppModule.class));
        ACCESS.put(RoleName.ROLE_ADMIN, EnumSet.allOf(AppModule.class));
        ACCESS.put(
                RoleName.ROLE_HR,
                EnumSet.of(
                        AppModule.DASHBOARD,
                        AppModule.EMPLOYEES,
                        AppModule.DEPARTMENTS,
                        AppModule.ATTENDANCE,
                        AppModule.LEAVE,
                        AppModule.PAYROLL,
                        AppModule.PERFORMANCE,
                        AppModule.ANALYTICS,
                        AppModule.AI_CHATBOT,
                        AppModule.USER_MANAGEMENT,
                        AppModule.AUDIT_LOGS));
        ACCESS.put(
                RoleName.ROLE_MANAGER,
                EnumSet.of(
                        AppModule.DASHBOARD,
                        AppModule.EMPLOYEES,
                        AppModule.ATTENDANCE,
                        AppModule.LEAVE,
                        AppModule.PAYROLL,
                        AppModule.PERFORMANCE,
                        AppModule.ANALYTICS,
                        AppModule.AI_CHATBOT));
        ACCESS.put(
                RoleName.ROLE_PAYROLL,
                EnumSet.of(
                        AppModule.DASHBOARD,
                        AppModule.EMPLOYEES,
                        AppModule.ATTENDANCE,
                        AppModule.LEAVE,
                        AppModule.PAYROLL,
                        AppModule.PERFORMANCE,
                        AppModule.ANALYTICS,
                        AppModule.AI_CHATBOT));
        ACCESS.put(
                RoleName.ROLE_EMPLOYEE,
                EnumSet.of(
                        AppModule.DASHBOARD,
                        AppModule.EMPLOYEES,
                        AppModule.ATTENDANCE,
                        AppModule.LEAVE,
                        AppModule.PAYROLL,
                        AppModule.PERFORMANCE,
                        AppModule.AI_CHATBOT));
        ACCESS.put(
                RoleName.ROLE_IT_ADMIN,
                EnumSet.of(
                        AppModule.DASHBOARD,
                        AppModule.EMPLOYEES,
                        AppModule.USER_MANAGEMENT,
                        AppModule.AUDIT_LOGS,
                        AppModule.AI_CHATBOT));
        ACCESS.put(
                RoleName.ROLE_EXECUTIVE,
                EnumSet.of(AppModule.DASHBOARD, AppModule.ANALYTICS, AppModule.AI_CHATBOT, AppModule.EMPLOYEES));
    }

    private RolePermissions() {}

    public static boolean canAccess(RoleName role, AppModule module) {
        Set<AppModule> modules = ACCESS.get(role);
        return modules != null && modules.contains(module);
    }

    public static boolean canAccessAny(Iterable<RoleName> roles, AppModule module) {
        for (RoleName role : roles) {
            if (canAccess(role, module)) {
                return true;
            }
        }
        return false;
    }

    public static boolean isExecutiveOnly(Iterable<RoleName> roles) {
        boolean hasExecutive = false;
        boolean hasOperational = false;
        for (RoleName role : roles) {
            if (role == RoleName.ROLE_EXECUTIVE) {
                hasExecutive = true;
            } else if (role != RoleName.ROLE_EMPLOYEE) {
                hasOperational = true;
            }
        }
        return hasExecutive && !hasOperational;
    }
}
