package nexusHR.auth.session;

import java.time.Duration;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.session.cache.enabled", havingValue = "false")
public class NoOpSessionCacheService implements SessionCacheService {

    @Override
    public void store(String sessionId, CachedSession session, Duration ttl) {}

    @Override
    public Optional<CachedSession> find(String sessionId) {
        return Optional.empty();
    }

    @Override
    public boolean isActive(String sessionId) {
        return true;
    }

    @Override
    public void invalidate(String sessionId) {}

    @Override
    public void invalidateAllForUser(Long userId) {}
}
