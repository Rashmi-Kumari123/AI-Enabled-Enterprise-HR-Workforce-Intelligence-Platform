package nexusHR.gateway.tenant;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTenantExtractor {
    private final SecretKey signingKey;

    public JwtTenantExtractor(@Value("${app.jwt.secret}") String secret) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("app.jwt.secret must be at least 32 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public Long extractTenantId(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(authorizationHeader.substring(7))
                    .getPayload();
            Object tenantId = claims.get("tenantId");
            if (tenantId instanceof Number number) {
                return number.longValue();
            }
        } catch (Exception ignored) {
            return null;
        }
        return null;
    }
}
