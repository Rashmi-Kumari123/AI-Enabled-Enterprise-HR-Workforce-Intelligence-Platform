package nexusHR.common.tenant;
public final class TenantContext {
    private static final ThreadLocal<Long> TENANT_ID = new ThreadLocal<>();
    private TenantContext() {}
    public static void setTenantId(Long tenantId) {
        TENANT_ID.set(tenantId);
    }
    public static Long getTenantId() {
        return TENANT_ID.get();
    }
    public static Long requireTenantId() {
        Long tenantId = TENANT_ID.get();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context is not set");
        }
        return tenantId;
    }
    public static void clear() {
        TENANT_ID.remove();
    }
}
