package nexusHR.notification.dto;
import java.time.Instant;
import nexusHR.notification.entity.Notification;
import nexusHR.notification.enums.NotificationType;

public record NotificationMessage(
        Long id,
        String title,
        String message,
        NotificationType type,
        String referenceType,
        Long referenceId,
        boolean read,
        Instant createdAt) {

    public static NotificationMessage from(Notification notification) {
        return new NotificationMessage(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceType(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getCreatedAt());
    }
}
