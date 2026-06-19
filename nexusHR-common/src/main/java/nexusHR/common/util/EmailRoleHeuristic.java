package nexusHR.common.util;
import nexusHR.common.enums.RoleName;
public final class EmailRoleHeuristic {
    private EmailRoleHeuristic() {}
    public static RoleName resolveRoleFromEmail(String email) {
        String normalized = email.toLowerCase().trim();
        int atIndex = normalized.indexOf('@');
        String localPart = atIndex > 0 ? normalized.substring(0, atIndex) : normalized;
        if (localPart.contains("admin")) {
            return RoleName.ROLE_ADMIN;
        }
        if (localPart.contains("hr")) {
            return RoleName.ROLE_HR;
        }
        if (localPart.contains("manager")) {
            return RoleName.ROLE_MANAGER;
        }
        return RoleName.ROLE_EMPLOYEE;
    }
    public static boolean isPlatformOperatorEmail(String email) {
        return resolveRoleFromEmail(email) != RoleName.ROLE_EMPLOYEE;
    }
}
