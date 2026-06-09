package nexusHR.notification.channel;
import nexusHR.notification.enums.DeliveryStatus;
public record EmailSendResult(DeliveryStatus status, String recipient, String errorMessage) {
    public static EmailSendResult sent(String recipient) {
        return new EmailSendResult(DeliveryStatus.SENT, recipient, null);
    }
    public static EmailSendResult failed(String recipient, String error) {
        return new EmailSendResult(DeliveryStatus.FAILED, recipient, error);
    }
    public static EmailSendResult skipped(String reason) {
        return new EmailSendResult(DeliveryStatus.SKIPPED, null, reason);
    }
}
