package nexusHR.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import nexusHR.common.enums.RoleName;
import org.junit.jupiter.api.Test;

class AuthServiceRoleResolutionTest {

    @Test
    void assignsAdminFromLocalPartKeyword() {
        assertEquals(RoleName.ROLE_ADMIN, AuthService.resolveRoleFromEmail("admin@company.com"));
        assertEquals(RoleName.ROLE_ADMIN, AuthService.resolveRoleFromEmail("admin.test@nexushr.com"));
    }

    @Test
    void assignsHrFromLocalPartKeyword() {
        assertEquals(RoleName.ROLE_HR, AuthService.resolveRoleFromEmail("hr.user@company.com"));
        assertEquals(RoleName.ROLE_HR, AuthService.resolveRoleFromEmail("hr.user@nexushr.com"));
    }

    @Test
    void doesNotMatchKeywordsInDomain() {
        assertEquals(RoleName.ROLE_EMPLOYEE, AuthService.resolveRoleFromEmail("day3.user@nexushr.com"));
        assertEquals(RoleName.ROLE_EMPLOYEE, AuthService.resolveRoleFromEmail("employee.only@nexushr.com"));
    }
}
