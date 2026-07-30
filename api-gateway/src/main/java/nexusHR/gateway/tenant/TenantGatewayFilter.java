package nexusHR.gateway.tenant;

import java.util.Locale;
import nexusHR.common.tenant.TenantHeaders;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class TenantGatewayFilter implements GlobalFilter, Ordered {
    private static final String DEFAULT_TENANT = "nexushr";

    private final JwtTenantExtractor jwtTenantExtractor;

    public TenantGatewayFilter(JwtTenantExtractor jwtTenantExtractor) {
        this.jwtTenantExtractor = jwtTenantExtractor;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String slug = request.getHeaders().getFirst(TenantHeaders.TENANT_SLUG);
        if (slug == null || slug.isBlank()) {
            slug = DEFAULT_TENANT;
        }
        slug = slug.toLowerCase(Locale.ROOT);

        ServerHttpRequest.Builder mutated = request.mutate().header(TenantHeaders.TENANT_SLUG, slug);

        Long tenantId = jwtTenantExtractor.extractTenantId(request.getHeaders().getFirst("Authorization"));
        if (tenantId != null) {
            mutated.header(TenantHeaders.TENANT_ID, tenantId.toString());
        }

        return chain.filter(exchange.mutate().request(mutated.build()).build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
