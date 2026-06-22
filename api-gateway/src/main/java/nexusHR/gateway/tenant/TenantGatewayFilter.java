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
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String slug = request.getHeaders().getFirst(TenantHeaders.TENANT_SLUG);
        if (slug == null || slug.isBlank()) {
            slug = resolveSlugFromHost(request.getHeaders().getFirst("Host"));
        }
        if (slug == null || slug.isBlank()) {
            return chain.filter(exchange);
        }
        ServerHttpRequest mutated =
                request.mutate().header(TenantHeaders.TENANT_SLUG, slug.toLowerCase(Locale.ROOT)).build();
        return chain.filter(exchange.mutate().request(mutated).build());
    }

    static String resolveSlugFromHost(String host) {
        if (host == null || host.isBlank()) {
            return null;
        }
        String normalized = host.split(":")[0].toLowerCase(Locale.ROOT);
        if (normalized.equals("localhost") || normalized.equals("127.0.0.1")) {
            return null;
        }
        String[] parts = normalized.split("\\.");
        if (parts.length >= 3 && !parts[0].equals("www") && !parts[0].equals("api")) {
            return parts[0];
        }
        return null;
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
