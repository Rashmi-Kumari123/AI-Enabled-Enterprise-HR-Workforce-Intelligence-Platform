package nexusHR.notification.channel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
public class SmsNotificationSender {
    private final boolean enabled;
    private final String provider;
    private final String twilioAccountSid;
    private final String twilioAuthToken;
    private final String twilioFromNumber;

    public SmsNotificationSender(
            @Value("${app.notifications.sms.enabled:true}") boolean enabled,
            @Value("${app.notifications.sms.provider:log}") String provider,
            @Value("${app.notifications.sms.twilio.account-sid:}") String twilioAccountSid,
            @Value("${app.notifications.sms.twilio.auth-token:}") String twilioAuthToken,
            @Value("${app.notifications.sms.twilio.from-number:}") String twilioFromNumber) {
        this.enabled = enabled;
        this.provider = provider;
        this.twilioAccountSid = twilioAccountSid;
        this.twilioAuthToken = twilioAuthToken;
        this.twilioFromNumber = twilioFromNumber;
    }

    public EmailSendResult send(String to, String body) {
        if (!enabled) {
            return EmailSendResult.skipped("SMS channel disabled");
        }
        if (to == null || to.isBlank()) {
            return EmailSendResult.skipped("Missing recipient phone");
        }

        String normalized = to.trim();
        if ("twilio".equalsIgnoreCase(provider)) {
            return sendViaTwilio(normalized, body);
        }

        log.info("SMS [{}] → {}: {}", provider, normalized, body);
        return EmailSendResult.sent(normalized);
    }

    private EmailSendResult sendViaTwilio(String to, String body) {
        if (twilioAccountSid.isBlank() || twilioAuthToken.isBlank() || twilioFromNumber.isBlank()) {
            return EmailSendResult.skipped("Twilio credentials not configured");
        }

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("To", to);
            form.add("From", twilioFromNumber);
            form.add("Body", body);

            RestClient.builder()
                    .baseUrl("https://api.twilio.com")
                    .defaultHeaders(headers -> headers.setBasicAuth(twilioAccountSid, twilioAuthToken))
                    .build()
                    .post()
                    .uri("/2010-04-01/Accounts/{accountSid}/Messages.json", twilioAccountSid)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();

            log.info("Twilio SMS sent to {}", to);
            return EmailSendResult.sent(to);
        } catch (Exception ex) {
            log.warn("Twilio SMS failed for {}: {}", to, ex.getMessage());
            return EmailSendResult.failed(to, ex.getMessage());
        }
    }
}
