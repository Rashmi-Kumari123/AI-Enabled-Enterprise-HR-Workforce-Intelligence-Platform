package nexusHR.auth.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {
    private final Map<String, AttemptWindow> attempts = new ConcurrentHashMap<>();

    @Value("${app.auth.login-rate-limit.max-attempts:20}")
    private int maxAttempts;

    @Value("${app.auth.login-rate-limit.window-seconds:60}")
    private long windowSeconds;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!HttpMethod.POST.matches(request.getMethod())
                || !request.getRequestURI().endsWith("/api/v1/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }
        String clientKey = resolveClientKey(request);
        AttemptWindow window = attempts.computeIfAbsent(clientKey, key -> new AttemptWindow());
        if (!window.tryConsume(maxAttempts, windowSeconds)) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter()
                    .write("{\"message\":\"Too many login attempts. Please try again later.\",\"status\":429}");
            return;
        }

        filterChain.doFilter(request, response);
    }
    private static String resolveClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
    private static final class AttemptWindow {
        private int count;
        private Instant windowStart = Instant.now();

        synchronized boolean tryConsume(int maxAttempts, long windowSeconds) {
            Instant now = Instant.now();
            if (now.isAfter(windowStart.plusSeconds(windowSeconds))) {
                count = 0;
                windowStart = now;
            }
            count++;
            return count <= maxAttempts;
        }
    }
}
