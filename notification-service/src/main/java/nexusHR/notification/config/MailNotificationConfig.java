package nexusHR.notification.config;
import nexusHR.notification.channel.EmailNotificationSender;
import nexusHR.notification.channel.SpringMailEmailNotificationSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
@Configuration
@ConditionalOnClass(name = "org.springframework.mail.javamail.JavaMailSender")
public class MailNotificationConfig {
    @Bean
    EmailNotificationSender springMailEmailNotificationSender(
            JavaMailSender mailSender,
            @Value("${app.notifications.email.enabled:true}") boolean enabled,
            @Value("${app.notifications.email.from:nexushr@localhost}") String fromAddress) {
        return new SpringMailEmailNotificationSender(mailSender, enabled, fromAddress);
    }
}
