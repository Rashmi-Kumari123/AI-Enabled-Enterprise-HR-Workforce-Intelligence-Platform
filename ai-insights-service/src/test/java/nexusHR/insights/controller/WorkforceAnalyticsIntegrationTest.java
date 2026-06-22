package nexusHR.insights.controller;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
@SpringBootTest
@AutoConfigureMockMvc
class WorkforceAnalyticsIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Test
    @WithMockUser(roles = "MANAGER")
    void managerCannotAccessWorkforceAnalytics() throws Exception {
        mockMvc.perform(get("/api/v1/ai/analytics/workforce"))
                .andExpect(status().isForbidden());
    }
    @Test
    @WithMockUser(roles = "ADMIN")
    void adminGetsWorkforceAnalytics() throws Exception {
        mockMvc.perform(get("/api/v1/ai/analytics/workforce"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees").isNumber())
                .andExpect(jsonPath("$.departmentBreakdown").isArray());
    }
    @Test
    @WithMockUser(roles = "ADMIN")
    void hrCanAccessWorkforceAnalytics() throws Exception {
        mockMvc.perform(get("/api/v1/ai/analytics/workforce").with(user("hr@nexushr.com").roles("HR")))
                .andExpect(status().isOk());
    }
}
