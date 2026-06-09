package nexusHR.notification.dto;
import java.util.Map;
import nexusHR.notification.enums.DeliveryStatus;
import nexusHR.notification.enums.NotificationChannel;
public record DeliveryStatsResponse(
        Map<NotificationChannel, Map<DeliveryStatus, Long>> byChannel,
        long totalSent,
        long totalFailed,
        double deliveryRatePercent) {}
