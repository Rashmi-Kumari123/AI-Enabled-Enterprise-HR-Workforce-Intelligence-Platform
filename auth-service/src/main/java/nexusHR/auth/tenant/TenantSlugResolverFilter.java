package nexusHR.auth.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.service.TenantService;
import nexusHR.common.tenant.TenantContext;
import nexusHR.common.tenant.TenantHeaders;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@RequiredArgsConstructor
public class TenantSlugResolverFilter extends OncePerRequestFilter {
    private final TenantService tenantService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (TenantContext.getTenantId() == null) {
            String slug = request.getHeader(TenantHeaders.TENANT_SLUG);
            if (slug != null && !slug.isBlank()) {
                TenantContext.setTenantId(tenantService.requireBySlug(slug).getId());
            }
        }
        filterChain.doFilter(request, response);
    }
}
