package nexusHR.insights.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import nexusHR.common.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey signingKey;
I
    public JwtService(@Value("${app.jwt.secret}") String secret) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("app.jwt.secret must be at least 32 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = parseClaims(token).get("roles");
        if (roles instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return Collections.emptyList();
    }

    public Long extractTenantId(String token) {
        Object tenantId = parseClaims(token).get("tenantId");
        if (tenantId instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }

    /** Short-lived HR token for scheduled jobs that call downstream services. */
    public String createHrServiceToken(String email) {
        var builder = Jwts.builder()
                .subject(email)
                .claim("roles", List.of("ROLE_HR"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3_600_000));
        Long tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            builder.claim("tenantId", tenantId);
        }
        return builder.signWith(signingKey).compact();
    }
}
