package nexusHR.insights.controller;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class WorkforceIntelligenceIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Test
    @WithMockUser(roles = "MANAGER")
    void scoreEngagementFromPayload() throws Exception {
        mockMvc.perform(post("/api/v1/ai/engagement/score")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "employeeName": "Jane Doe",
                                  "department": "Engineering",
                                  "tenureMonths": 12,
                                  "employmentStatus": "ACTIVE",
                                  "averagePerformanceRating": 4.2,
                                  "totalReviews": 2,
                                  "approvedLeaveDaysLast12Months": 8,
                                  "pendingLeaveRequests": 0,
                                  "absentDaysLast30": 1,
                                  "presentDaysLast30": 21
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.engagementLevel").value("HIGH"))
                .andExpect(jsonPath("$.engagementScore").isNumber());
    }
    @Test
    @WithMockUser(roles = "MANAGER")
    void analyzeSkillGapsFromPayload() throws Exception {
        mockMvc.perform(post("/api/v1/ai/skills/gaps/analyze")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "employeeName": "Jane Doe",
                                  "department": "Engineering",
                                  "tenureMonths": 12,
                                  "employmentStatus": "ACTIVE",
                                  "averagePerformanceRating": 3.4,
                                  "totalReviews": 2,
                                  "approvedLeaveDaysLast12Months": 8,
                                  "pendingLeaveRequests": 0,
                                  "absentDaysLast30": 1,
                                  "presentDaysLast30": 21,
                                  "skillRatingsByCriterion": {
                                    "TECHNICAL_SKILLS": 2.8,
                                    "COMMUNICATION": 4.2,
                                    "TEAMWORK": 3.5,
                                    "DELIVERY": 3.9,
                                    "INITIATIVE": 4.0
                                  }
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gapCount").value(3))
                .andExpect(jsonPath("$.gaps[0].skill").exists())
                .andExpect(jsonPath("$.developmentPlan").isArray());
    }
}
