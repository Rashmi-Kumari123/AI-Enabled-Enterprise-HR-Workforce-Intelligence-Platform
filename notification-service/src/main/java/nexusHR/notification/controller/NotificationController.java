package nexusHR.notification.controller;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.notification.dto.DeliveryStatsResponse;
import nexusHR.notification.dto.DispatchNotificationRequest;
import nexusHR.notification.dto.NotificationResponse;
import nexusHR.notification.dto.UnreadCountResponse;
import nexusHR.notification.exception.ApiException;
import nexusHR.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @Value("${app.notifications.internal-key}")
    private String internalKey;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "notification-service");
    }
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public List<NotificationResponse> myNotifications(Authentication authentication) {
        return notificationService.listForUser(authentication.getName());
    }

    @GetMapping("/me/unread-count")
    @PreAuthorize("isAuthenticated()")
    public UnreadCountResponse unreadCount(Authentication authentication) {
        return notificationService.unreadCount(authentication.getName());
    }
    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public NotificationResponse markRead(@PathVariable Long id, Authentication authentication) {
        return notificationService.markRead(id, authentication.getName());
    }
    @PostMapping("/me/read-all")
    @PreAuthorize("isAuthenticated()")
    public UnreadCountResponse markAllRead(Authentication authentication) {
        return notificationService.markAllRead(authentication.getName());
    }
    @GetMapping("/delivery-stats")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public DeliveryStatsResponse deliveryStats() {
        return notificationService.deliveryStats();
    }
    @PostMapping("/dispatch")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public NotificationResponse dispatch(@Valid @RequestBody DispatchNotificationRequest request) {
        return notificationService.dispatch(request);
    }
    @PostMapping("/internal/dispatch")
    public NotificationResponse internalDispatch(
            @RequestHeader("X-Internal-Key") String key, @Valid @RequestBody DispatchNotificationRequest request) {
        if (!internalKey.equals(key)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid internal key");
        }
        return notificationService.dispatch(request);
    }
}
