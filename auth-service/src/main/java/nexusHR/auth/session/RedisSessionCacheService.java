package nexusHR.auth.session;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.session.cache.enabled", havingValue = "true", matchIfMissing = true)
public class RedisSessionCacheService implements SessionCacheService {

    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_SESSIONS_KEY_PREFIX = "user-sessions:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void store(String sessionId, CachedSession session, Duration ttl) {
        String sessionKey = sessionKey(sessionId);
        try {
            redisTemplate
                    .opsForValue()
                    .set(sessionKey, objectMapper.writeValueAsString(session), ttl.toMillis(), TimeUnit.MILLISECONDS);
            redisTemplate.opsForSet().add(userSessionsKey(session.userId()), sessionId);
            redisTemplate.expire(userSessionsKey(session.userId()), ttl);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to cache session", ex);
        }
    }

    @Override
    public Optional<CachedSession> find(String sessionId) {
        String payload = redisTemplate.opsForValue().get(sessionKey(sessionId));
        if (payload == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(payload, CachedSession.class));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    @Override
    public boolean isActive(String sessionId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(sessionKey(sessionId)));
    }

    @Override
    public void invalidate(String sessionId) {
        find(sessionId).ifPresent(session -> {
            redisTemplate.delete(sessionKey(sessionId));
            redisTemplate.opsForSet().remove(userSessionsKey(session.userId()), sessionId);
        });
    }

    @Override
    public void invalidateAllForUser(Long userId) {
        String userKey = userSessionsKey(userId);
        Set<String> sessionIds = redisTemplate.opsForSet().members(userKey);
        if (sessionIds != null) {
            sessionIds.forEach(sessionId -> redisTemplate.delete(sessionKey(sessionId)));
        }
        redisTemplate.delete(userKey);
    }

    private static String sessionKey(String sessionId) {
        return SESSION_KEY_PREFIX + sessionId;
    }

    private static String userSessionsKey(Long userId) {
        return USER_SESSIONS_KEY_PREFIX + userId;
    }
}
