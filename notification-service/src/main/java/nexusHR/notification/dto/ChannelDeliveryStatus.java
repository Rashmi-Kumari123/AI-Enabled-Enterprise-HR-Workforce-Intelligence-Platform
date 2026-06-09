package nexusHR.notification.dto;
import nexusHR.notification.enums.DeliveryStatus;
import nexusHR.notification.enums.NotificationChannel;
public record ChannelDeliveryStatus(
        NotificationChannel channel, DeliveryStatus status, String recipient) {}
