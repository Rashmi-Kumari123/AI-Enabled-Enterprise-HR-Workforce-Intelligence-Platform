package nexusHR.common.tenant;

import jakarta.servlet.http.HttpServletRequest;

public final class TenantContextResolver {
    private TenantContextResolver() {}

    public static void resolve(HttpServletRequest request, Long jwtTenantId) {
        if (TenantContext.getTenantId() != null) {
            return;
        }
        String tenantIdHeader = request.getHeader(TenantHeaders.TENANT_ID);
        if (tenantIdHeader != null && !tenantIdHeader.isBlank()) {
            TenantContext.setTenantId(Long.parseLong(tenantIdHeader.trim()));
            return;
        }
        if (jwtTenantId != null) {
            TenantContext.setTenantId(jwtTenantId);
        }
    }
}
