package nexusHR.notification.channel;
public interface EmailNotificationSender {
    EmailSendResult send(String to, String subject, String body);
}
