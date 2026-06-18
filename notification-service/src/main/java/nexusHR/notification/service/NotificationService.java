package nexusHR.notification.service;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.notification.channel.MultiChannelNotificationDispatcher;
import nexusHR.notification.dto.ChannelDeliveryStatus;
import nexusHR.notification.dto.DeliveryStatsResponse;
import nexusHR.notification.dto.DispatchNotificationRequest;
import nexusHR.notification.dto.NotificationMessage;
import nexusHR.notification.dto.NotificationResponse;
import nexusHR.notification.dto.UnreadCountResponse;
import nexusHR.notification.entity.Notification;
import nexusHR.notification.enums.DeliveryStatus;
import nexusHR.notification.enums.NotificationAudience;
import nexusHR.notification.enums.NotificationChannel;
import nexusHR.notification.enums.NotificationType;
import nexusHR.notification.exception.ApiException;
import nexusHR.notification.repository.NotificationDeliveryRepository;
import nexusHR.notification.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationDeliveryRepository notificationDeliveryRepository;
    private final NotificationDeliveryService notificationDeliveryService;
    private final MultiChannelNotificationDispatcher multiChannelNotificationDispatcher;

    @Transactional(readOnly = true)
    public List<NotificationResponse> listForUser(String email) {
        return notificationRepository.findTop20ByRecipientEmailOrderByCreatedAtDesc(normalize(email)).stream()
                .map(this::toResponse)
                .toList();
    }
    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(String email) {
        long count = notificationRepository.countByRecipientEmailAndReadFalse(normalize(email));
        return new UnreadCountResponse(count);
    }
    @Transactional(readOnly = true)
    public DeliveryStatsResponse deliveryStats() {
        Map<NotificationChannel, Map<DeliveryStatus, Long>> byChannel = new EnumMap<>(NotificationChannel.class);
        long totalSent = 0;
        long totalFailed = 0;

        for (Object[] row : notificationDeliveryRepository.aggregateDeliveryStats()) {
            NotificationChannel channel = (NotificationChannel) row[0];
            DeliveryStatus status = (DeliveryStatus) row[1];
            long count = (Long) row[2];
            byChannel.computeIfAbsent(channel, key -> new EnumMap<>(DeliveryStatus.class)).put(status, count);
            if (status == DeliveryStatus.SENT) {
                totalSent += count;
            } else if (status == DeliveryStatus.FAILED) {
                totalFailed += count;
            }
        }

        long attempts = totalSent + totalFailed;
        double rate = attempts == 0 ? 100.0 : (totalSent * 100.0) / attempts;
        return new DeliveryStatsResponse(byChannel, totalSent, totalFailed, Math.round(rate * 10.0) / 10.0);
    }
    @Transactional
    public NotificationResponse markRead(Long id, String email) {
        int updated = notificationRepository.markRead(id, normalize(email));
        if (updated == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Notification not found");
        }
        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        return toResponse(notification);
    }
    @Transactional
    public UnreadCountResponse markAllRead(String email) {
        notificationRepository.markAllRead(normalize(email));
        return unreadCount(email);
    }
    @Transactional
    public NotificationResponse dispatch(DispatchNotificationRequest request) {
        if (request.audience() == NotificationAudience.USER) {
            if (request.recipientEmail() == null || request.recipientEmail().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "recipientEmail is required for USER audience");
            }
            return createAndDeliver(
                    normalize(request.recipientEmail()),
                    request.title(),
                    request.message(),
                    request.type(),
                    request.referenceType(),
                    request.referenceId(),
                    NotificationAudience.USER,
                    false);
        }
        Notification saved = persist(
                "managers@nexushr.local",
                request.title(),
                request.message(),
                request.type(),
                request.referenceType(),
                request.referenceId(),
                false);
        NotificationMessage message = NotificationMessage.from(saved);
        notificationDeliveryService.broadcastToManagers(message);
        multiChannelNotificationDispatcher.recordInAppDelivery(saved, "managers@nexushr.local");
        multiChannelNotificationDispatcher.dispatchEmail(saved, NotificationAudience.MANAGERS, null);
        return toResponse(saved);
    }
    @Transactional
    public NotificationResponse notifyUser(
            String recipientEmail,
            String title,
            String message,
            NotificationType type,
            String referenceType,
            Long referenceId) {
        return createAndDeliver(
                recipientEmail, title, message, type, referenceType, referenceId, NotificationAudience.USER, false);
    }
    @Transactional
    public NotificationResponse notifyManagers(
            String title,
            String message,
            NotificationType type,
            String referenceType,
            Long referenceId) {
        return dispatch(new DispatchNotificationRequest(
                NotificationAudience.MANAGERS, null, title, message, type, referenceType, referenceId));
    }
    private NotificationResponse createAndDeliver(
            String recipientEmail,
            String title,
            String message,
            NotificationType type,
            String referenceType,
            Long referenceId,
            NotificationAudience audience,
            boolean read) {
        Notification saved = persist(recipientEmail, title, message, type, referenceType, referenceId, read);
        NotificationMessage payload = NotificationMessage.from(saved);
        notificationDeliveryService.sendToUser(recipientEmail, payload);
        multiChannelNotificationDispatcher.recordInAppDelivery(saved, recipientEmail);
        multiChannelNotificationDispatcher.dispatchEmail(saved, audience, recipientEmail);
        return toResponse(saved);
    }
    private Notification persist(
            String recipientEmail,
            String title,
            String message,
            NotificationType type,
            String referenceType,
            Long referenceId,
            boolean read) {
        Notification notification = new Notification();
        notification.setRecipientEmail(recipientEmail);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        notification.setRead(read);
        return notificationRepository.save(notification);
    }
    private NotificationResponse toResponse(Notification notification) {
        List<ChannelDeliveryStatus> deliveries = notificationDeliveryRepository
                .findByNotificationIdOrderByCreatedAtAsc(notification.getId())
                .stream()
                .map(d -> new ChannelDeliveryStatus(d.getChannel(), d.getStatus(), d.getRecipient()))
                .toList();
        return toResponse(notification, deliveries);
    }
    private NotificationResponse toResponse(Notification notification, List<ChannelDeliveryStatus> deliveries) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipientEmail(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceType(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getCreatedAt(),
                deliveries);
    }
    private static String normalize(String email) {
        return email.trim().toLowerCase();
    }
}
