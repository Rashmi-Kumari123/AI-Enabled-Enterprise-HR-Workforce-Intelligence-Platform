package nexusHR.notification.channel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;
@Slf4j
@Service
@ConditionalOnMissingBean(EmailNotificationSender.class)
public class LoggingEmailNotificationSender implements EmailNotificationSender {
    private final boolean enabled;
    public LoggingEmailNotificationSender(
            @Value("${app.notifications.email.enabled:true}") boolean enabled) {
        this.enabled = enabled;
    }
    @Override
    public EmailSendResult send(String to, String subject, String body) {
        if (!enabled) {
            return EmailSendResult.skipped("Email channel disabled");
        }
        if (to == null || to.isBlank()) {
            return EmailSendResult.skipped("Missing recipient email");
        }
        log.info("Email [{}] → {} | {} — {}", "log", to.trim(), subject, body);
        return EmailSendResult.sent(to.trim());
    }
}
