package nexusHR.auth.session;

import java.time.Duration;
import java.util.Optional;

public interface SessionCacheService {
    void store(String sessionId, CachedSession session, Duration ttl);

    Optional<CachedSession> find(String sessionId);

    boolean isActive(String sessionId);

    void invalidate(String sessionId);

    void invalidateAllForUser(Long userId);
}
