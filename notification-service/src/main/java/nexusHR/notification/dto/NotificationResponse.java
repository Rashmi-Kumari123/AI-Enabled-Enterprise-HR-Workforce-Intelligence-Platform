package nexusHR.notification.dto;
import java.time.Instant;
import java.util.List;
import nexusHR.notification.enums.NotificationType;

public record NotificationResponse(
        Long id,
        String recipientEmail,
        String title,
        String message,
        NotificationType type,
        String referenceType,
        Long referenceId,
        boolean read,
        Instant createdAt,
        List<ChannelDeliveryStatus> deliveries) {}
