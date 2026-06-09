package nexusHR.notification.service;
import lombok.RequiredArgsConstructor;
import nexusHR.notification.dto.NotificationMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationDeliveryService {
    public static final String USER_QUEUE = "/queue/notifications";
    public static final String MANAGER_TOPIC = "/topic/managers/notifications";
    private final SimpMessagingTemplate messagingTemplate;

    public void sendToUser(String recipientEmail, NotificationMessage message) {
        messagingTemplate.convertAndSendToUser(recipientEmail, USER_QUEUE, message);
    }
    public void broadcastToManagers(NotificationMessage message) {
        messagingTemplate.convertAndSend(MANAGER_TOPIC, message);
    }
}
