package nexusHR.common.tenant;
public final class TenantAccess {
    private TenantAccess() {}
    public static Long requireTenantId() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context is not set");
        }
        return tenantId;
    }
    public static void assertSameTenant(Long resourceTenantId) {
        Long tenantId = requireTenantId();
        if (resourceTenantId == null || !tenantId.equals(resourceTenantId)) {
            throw new IllegalStateException("Cross-tenant access denied");
        }
    }
}
