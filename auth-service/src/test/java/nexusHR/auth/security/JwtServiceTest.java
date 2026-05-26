package nexusHR.auth.security;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

class JwtServiceTest {
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService("local-dev-secret-change-before-production-min-32-chars", 3600000);
    }
    @Test
    void generatesAndValidatesToken() {
        User user = new User(
                "hr@nexushr.com",
                "encoded-password",
                List.of(new SimpleGrantedAuthority("ROLE_HR")));

        String token = jwtService.generateToken(user);
        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("hr@nexushr.com");
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }
}
