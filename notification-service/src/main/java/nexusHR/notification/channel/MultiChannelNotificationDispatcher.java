package nexusHR.notification.channel;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.notification.dto.ChannelDeliveryStatus;
import nexusHR.notification.entity.Notification;
import nexusHR.notification.entity.NotificationDelivery;
import nexusHR.notification.enums.DeliveryStatus;
import nexusHR.notification.enums.NotificationAudience;
import nexusHR.notification.enums.NotificationChannel;
import nexusHR.notification.repository.NotificationDeliveryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class MultiChannelNotificationDispatcher {
    private final EmailNotificationSender emailNotificationSender;
    private final NotificationDeliveryRepository notificationDeliveryRepository;

    @Value("${app.notifications.manager-emails:manager@nexushr.com,hr@nexushr.com}")
    private String managerEmails;

    public List<ChannelDeliveryStatus> dispatchEmail(
            Notification notification,
            NotificationAudience audience,
            String recipientEmail) {
        if (audience == NotificationAudience.USER) {
            return List.of(recordDelivery(
                    notification,
                    NotificationChannel.EMAIL,
                    emailNotificationSender.send(
                            recipientEmail, notification.getTitle(), formatBody(notification))));
        }
        return splitCsv(managerEmails).stream()
                .map(email -> recordDelivery(
                        notification,
                        NotificationChannel.EMAIL,
                        emailNotificationSender.send(email, notification.getTitle(), formatBody(notification))))
                .toList();
    }

    public ChannelDeliveryStatus recordInAppDelivery(Notification notification, String recipient) {
        return recordDelivery(
                notification, NotificationChannel.IN_APP, EmailSendResult.sent(recipient));
    }

    private ChannelDeliveryStatus recordDelivery(
            Notification notification, NotificationChannel channel, EmailSendResult result) {
        NotificationDelivery delivery = new NotificationDelivery();
        delivery.setNotification(notification);
        delivery.setChannel(channel);
        delivery.setStatus(result.status());
        delivery.setRecipient(result.recipient());
        delivery.setErrorMessage(result.errorMessage());
        if (result.status() == DeliveryStatus.SENT) {
            delivery.setSentAt(Instant.now());
        }
        notificationDeliveryRepository.save(delivery);
        return new ChannelDeliveryStatus(channel, result.status(), result.recipient());
    }

    private static String formatBody(Notification notification) {
        StringBuilder body = new StringBuilder(notification.getMessage());
        body.append("\n\n— NexusHR");
        if (notification.getReferenceType() != null && notification.getReferenceId() != null) {
            body.append("\nReference: ")
                    .append(notification.getReferenceType())
                    .append(" #")
                    .append(notification.getReferenceId());
        }
        body.append("\nType: ").append(notification.getType());
        return body.toString();
    }

    private static List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
