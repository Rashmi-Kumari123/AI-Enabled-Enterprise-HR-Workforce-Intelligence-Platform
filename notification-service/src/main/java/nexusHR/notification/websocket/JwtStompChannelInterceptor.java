package nexusHR.notification.websocket;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.notification.security.JwtService;
import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtStompChannelInterceptor implements ChannelInterceptor {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }
        String authHeader = accessor.getFirstNativeHeader(AUTHORIZATION_HEADER);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            throw new IllegalArgumentException("Missing Authorization header on STOMP CONNECT");
        }
        String jwt = authHeader.substring(BEARER_PREFIX.length());
        if (!jwtService.isTokenValid(jwt)) {
            throw new IllegalArgumentException("Invalid JWT on STOMP CONNECT");
        }
        String username = jwtService.extractUsername(jwt);
        List<SimpleGrantedAuthority> authorities = jwtService.extractRoles(jwt).stream()
                .map(SimpleGrantedAuthority::new)
                .toList();
        accessor.setUser(new UsernamePasswordAuthenticationToken(username, null, authorities));
        return message;
    }
    @Override
    public void afterSendCompletion(
            Message<?> message, MessageChannel channel, boolean sent, @Nullable Exception ex) {
        // no-op
    }
}
