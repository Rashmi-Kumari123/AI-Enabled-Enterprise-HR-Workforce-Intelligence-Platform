package nexusHR.insights.controller;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class AttritionInsightIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/api/v1/ai/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("ai-insights-service"));
    }
    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeCannotPredict() throws Exception {
        mockMvc.perform(post("/api/v1/ai/attrition/predict")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "employeeName": "Jane Doe",
                                  "department": "Engineering",
                                  "tenureMonths": 8,
                                  "employmentStatus": "ACTIVE",
                                  "averagePerformanceRating": 2.2,
                                  "totalReviews": 2,
                                  "approvedLeaveDaysLast12Months": 15,
                                  "pendingLeaveRequests": 1,
                                  "absentDaysLast30": 4,
                                  "presentDaysLast30": 18
                                }
                                """))
                .andExpect(status().isForbidden());
    }
    @Test
    @WithMockUser(roles = "MANAGER")
    void managerPredictsHighRiskWithHeuristicProvider() throws Exception {
        mockMvc.perform(post("/api/v1/ai/attrition/predict")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "employeeName": "Jane Doe",
                                  "department": "Engineering",
                                  "tenureMonths": 8,
                                  "employmentStatus": "ACTIVE",
                                  "averagePerformanceRating": 2.2,
                                  "totalReviews": 2,
                                  "approvedLeaveDaysLast12Months": 15,
                                  "pendingLeaveRequests": 1,
                                  "absentDaysLast30": 4,
                                  "presentDaysLast30": 18
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskLevel").value("MEDIUM"))
                .andExpect(jsonPath("$.riskScore").value(58))
                .andExpect(jsonPath("$.provider").value("HEURISTIC"))
                .andExpect(jsonPath("$.aiEnabled").value(false))
                .andExpect(jsonPath("$.recommendations").isArray());
    }
}
