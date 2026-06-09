package nexusHR.notification.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import nexusHR.notification.enums.NotificationAudience;
import nexusHR.notification.enums.NotificationType;
public record DispatchNotificationRequest(
        @NotNull NotificationAudience audience,
        String recipientEmail,
        String recipientPhone,
        @NotBlank String title,
        @NotBlank String message,
        @NotNull NotificationType type,
        String referenceType,
        Long referenceId) {}
