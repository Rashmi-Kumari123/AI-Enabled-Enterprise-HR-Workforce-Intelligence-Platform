package nexusHR.performance.controller;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class PerformanceWorkflowIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Test
    @WithMockUser(username = "manager@nexushr.com", roles = "MANAGER")
    void createRateSubmitAndScorecard() throws Exception {
        MvcResult create = mockMvc.perform(post("/api/v1/performance/reviews")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "reviewYear": 2026,
                                  "reviewQuarter": 2,
                                  "goals": "Improve delivery velocity and mentoring"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();

        long reviewId =
                objectMapper.readTree(create.getResponse().getContentAsString()).get("id").asLong();
        mockMvc.perform(put("/api/v1/performance/reviews/" + reviewId + "/ratings")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "ratings": [
                                    { "criterion": "TECHNICAL_SKILLS", "score": 4, "comment": "Strong Java skills" },
                                    { "criterion": "COMMUNICATION", "score": 5 },
                                    { "criterion": "TEAMWORK", "score": 4 },
                                    { "criterion": "DELIVERY", "score": 4 },
                                    { "criterion": "INITIATIVE", "score": 5 }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallRating").value(4.40));

        mockMvc.perform(post("/api/v1/performance/reviews/" + reviewId + "/submit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));

        mockMvc.perform(post("/api/v1/performance/reviews/" + reviewId + "/acknowledge")
                        .with(user("employee@nexushr.com").roles("EMPLOYEE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACKNOWLEDGED"));

        mockMvc.perform(get("/api/v1/performance/reviews/employee/1/scorecard")
                        .with(user("employee@nexushr.com").roles("EMPLOYEE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReviews").value(1))
                .andExpect(jsonPath("$.averageOverallRating").value(4.40));
    }
    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeCannotCreateReview() throws Exception {
        mockMvc.perform(post("/api/v1/performance/reviews")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "reviewYear": 2026,
                                  "reviewQuarter": 1
                                }
                                """))
                .andExpect(status().isForbidden());
    }
}
