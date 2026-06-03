package nexusHR.auth.session;

import java.time.Instant;
import java.util.Set;

public record CachedSession(Long userId, String email, Set<String> roles, Instant createdAt) {}
