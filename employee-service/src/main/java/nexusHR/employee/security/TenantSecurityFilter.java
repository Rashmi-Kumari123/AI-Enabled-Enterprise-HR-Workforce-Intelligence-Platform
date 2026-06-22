package nexusHR.employee.security;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.common.tenant.TenantContext;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component
@RequiredArgsConstructor
public class TenantSecurityFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        if (isPublicPath(request)) {
            filterChain.doFilter(request, response);
            return;
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            if (jwtService.isTokenValid(jwt)) {
                Long tenantId = jwtService.extractTenantId(jwt);
                if (tenantId == null) {
                    writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Session expired. Please sign in again.");
                    return;
                }
                TenantContext.setTenantId(tenantId);
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    var authorities = jwtService.extractRoles(jwt).stream()
                            .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                            .toList();
                    SecurityContextHolder.getContext()
                            .setAuthentication(new org.springframework.security.authentication
                                    .UsernamePasswordAuthenticationToken(
                                    jwtService.extractUsername(jwt), null, authorities));
                }
            }
        }
        if (SecurityContextHolder.getContext().getAuthentication() != null
                && TenantContext.getTenantId() == null) {
            writeError(response, HttpServletResponse.SC_FORBIDDEN, "Tenant context required");
            return;
        }
        filterChain.doFilter(request, response);
    }
    private boolean isPublicPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/employees/health")
                || path.startsWith("/api/v1/employees/internal/")
                || path.startsWith("/actuator/")
                || path.startsWith("/error")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }
    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of("message", message, "status", status));
    }
}
