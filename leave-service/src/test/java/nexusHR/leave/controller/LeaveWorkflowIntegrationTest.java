package nexusHR.leave.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class LeaveWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void submitApproveAndListPending() throws Exception {
        MvcResult submit = mockMvc.perform(post("/api/v1/leaves")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "leaveType": "ANNUAL",
                                  "startDate": "2026-06-10",
                                  "endDate": "2026-06-12",
                                  "reason": "Family trip"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        JsonNode submitJson = objectMapper.readTree(submit.getResponse().getContentAsString());
        long leaveId = submitJson.get("id").asLong();

        mockMvc.perform(get("/api/v1/leaves/pending")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("hr@nexushr.com").roles("HR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value((int) leaveId));

        mockMvc.perform(post("/api/v1/leaves/" + leaveId + "/approve")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("hr@nexushr.com").roles("HR"))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"comment": "Approved - coverage arranged"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.reviewComment").value("Approved - coverage arranged"));

        mockMvc.perform(get("/api/v1/leaves/employee/1")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("employee@nexushr.com").roles("EMPLOYEE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("APPROVED"));

        mockMvc.perform(get("/api/v1/leaves/employee/1/balances")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("employee@nexushr.com").roles("EMPLOYEE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.leaveType == 'ANNUAL')].usedDays").value(3))
                .andExpect(jsonPath("$[?(@.leaveType == 'ANNUAL')].remainingDays").value(17));
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeCannotListPending() throws Exception {
        mockMvc.perform(get("/api/v1/leaves/pending"))
                .andExpect(status().isForbidden());
    }
}
