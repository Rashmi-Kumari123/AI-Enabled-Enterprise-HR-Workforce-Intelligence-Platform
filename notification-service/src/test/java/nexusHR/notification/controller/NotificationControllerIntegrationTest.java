package nexusHR.notification.controller;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
@SpringBootTest
@AutoConfigureMockMvc
class NotificationControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("notification-service"));
    }

    @Test
    void internalDispatchCreatesNotification() throws Exception {
        mockMvc.perform(post("/api/v1/notifications/internal/dispatch")
                        .header("X-Internal-Key", "test-internal-key")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "audience": "USER",
                                  "recipientEmail": "employee@nexushr.com",
                                  "title": "Leave approved",
                                  "message": "Your leave request was approved.",
                                  "type": "LEAVE_APPROVED",
                                  "referenceType": "LEAVE",
                                  "referenceId": 1
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recipientEmail").value("employee@nexushr.com"))
                .andExpect(jsonPath("$.read").value(false))
                .andExpect(jsonPath("$.deliveries").isArray())
                .andExpect(jsonPath("$.deliveries[0].channel").value("IN_APP"));
    }

    @Test
    void internalDispatchRecordsEmailDelivery() throws Exception {
        mockMvc.perform(post("/api/v1/notifications/internal/dispatch")
                        .header("X-Internal-Key", "test-internal-key")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "audience": "USER",
                                  "recipientEmail": "employee@nexushr.com",
                                  "title": "Leave approved",
                                  "message": "Your leave request was approved.",
                                  "type": "LEAVE_APPROVED",
                                  "referenceType": "LEAVE",
                                  "referenceId": 2
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deliveries[?(@.channel=='EMAIL')]").exists());
    }
    @Test
    void deliveryStatsRequiresAdminOrHr() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/delivery-stats")
                        .with(user("employee@nexushr.com").roles("EMPLOYEE")))
                .andExpect(status().isForbidden());
    }
    @Test
    void adminCanViewDeliveryStats() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/delivery-stats").with(user("admin@nexushr.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSent").isNumber())
                .andExpect(jsonPath("$.deliveryRatePercent").isNumber());
    }
    @Test
    void userCanListOwnNotifications() throws Exception {
        mockMvc.perform(post("/api/v1/notifications/internal/dispatch")
                .header("X-Internal-Key", "test-internal-key")
                .contentType(APPLICATION_JSON)
                .content("""
                        {
                          "audience": "USER",
                          "recipientEmail": "hr.user@company.com",
                          "title": "Welcome",
                          "message": "Real-time notifications are active.",
                          "type": "SYSTEM"
                        }
                        """));

        mockMvc.perform(get("/api/v1/notifications/me").with(user("hr.user@company.com").roles("HR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Welcome"));
    }
}
