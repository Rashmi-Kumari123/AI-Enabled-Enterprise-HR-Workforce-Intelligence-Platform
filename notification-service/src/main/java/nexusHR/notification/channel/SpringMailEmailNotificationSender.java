package nexusHR.notification.channel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Slf4j
public class SpringMailEmailNotificationSender implements EmailNotificationSender {
    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String fromAddress;

    public SpringMailEmailNotificationSender(
            JavaMailSender mailSender, boolean enabled, String fromAddress) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.fromAddress = fromAddress;
    }
    @Override
    public EmailSendResult send(String to, String subject, String body) {
        if (!enabled) {
            return EmailSendResult.skipped("Email channel disabled");
        }
        if (to == null || to.isBlank()) {
            return EmailSendResult.skipped("Missing recipient email");
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to.trim());
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {} — {}", to, subject);
            return EmailSendResult.sent(to.trim());
        } catch (Exception ex) {
            log.warn("Email delivery failed for {}: {}", to, ex.getMessage());
            return EmailSendResult.failed(to.trim(), ex.getMessage());
        }
    }
}
