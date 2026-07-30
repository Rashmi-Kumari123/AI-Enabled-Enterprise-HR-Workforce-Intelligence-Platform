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
import nexusHR.common.tenant.TenantHeaders;
import nexusHR.performance.integration.EmployeeServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
class PerformanceWorkflowIntegrationTest {
  private static final RequestPostProcessor TENANT_ONE =
      request -> {
        request.addHeader(TenantHeaders.TENANT_ID, "1");
        return request;
      };

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;

  @MockBean private EmployeeServiceClient employeeServiceClient;

  @BeforeEach
  void stubEmployeeLookup() {
    when(employeeServiceClient.fetchEmployee(anyLong()))
        .thenReturn(
            new EmployeeServiceClient.EmployeeSnapshot(
                1L, "EMP001", "Ananya", "Kumar", "employee@nexushr.com", "ACTIVE"));
  }

  @Test
  @WithMockUser(username = "manager@nexushr.com", roles = "MANAGER")
  void createRateSubmitSelfFeedbackAcknowledgeAndScorecard() throws Exception {
    MvcResult create =
        mockMvc
            .perform(
                post("/api/v1/performance/reviews")
                    .with(TENANT_ONE)
                    .contentType(APPLICATION_JSON)
                    .content(
                        """
                                {
                                  "employeeId": 1,
                                  "employeeEmail": "employee@nexushr.com",
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

    MvcResult feedbackList =
        mockMvc
            .perform(get("/api/v1/performance/reviews/" + reviewId + "/feedback").with(TENANT_ONE))
            .andExpect(status().isOk())
            .andReturn();
    JsonNode feedbackNodes = objectMapper.readTree(feedbackList.getResponse().getContentAsString());
    long managerFeedbackId = feedbackIdForType(feedbackNodes, "MANAGER");
    long selfFeedbackId = feedbackIdForType(feedbackNodes, "SELF");

    mockMvc
        .perform(
            put("/api/v1/performance/reviews/" + reviewId + "/ratings")
                .with(TENANT_ONE)
                .contentType(APPLICATION_JSON)
                .content(
                    """
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

    mockMvc
        .perform(
            post("/api/v1/performance/feedback/" + managerFeedbackId + "/submit")
                .with(TENANT_ONE)
                .with(user("manager@nexushr.com").roles("MANAGER")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("SUBMITTED"));

    mockMvc
        .perform(post("/api/v1/performance/reviews/" + reviewId + "/submit").with(TENANT_ONE))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("SUBMITTED"));

    mockMvc
        .perform(
            put("/api/v1/performance/feedback/" + selfFeedbackId + "/ratings")
                .with(TENANT_ONE)
                .with(user("employee@nexushr.com").roles("EMPLOYEE"))
                .contentType(APPLICATION_JSON)
                .content(
                    """
                                {
                                  "ratings": [
                                    { "criterion": "TECHNICAL_SKILLS", "score": 4 },
                                    { "criterion": "COMMUNICATION", "score": 4 },
                                    { "criterion": "TEAMWORK", "score": 5 },
                                    { "criterion": "DELIVERY", "score": 4 },
                                    { "criterion": "INITIATIVE", "score": 4 }
                                  ]
                                }
                                """))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/api/v1/performance/feedback/" + selfFeedbackId + "/submit")
                .with(TENANT_ONE)
                .with(user("employee@nexushr.com").roles("EMPLOYEE")))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/api/v1/performance/reviews/" + reviewId + "/acknowledge")
                .with(TENANT_ONE)
                .with(user("employee@nexushr.com").roles("EMPLOYEE")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ACKNOWLEDGED"));

    mockMvc
        .perform(
            get("/api/v1/performance/reviews/employee/1/scorecard")
                .with(TENANT_ONE)
                .with(user("employee@nexushr.com").roles("EMPLOYEE")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalReviews").value(1))
        .andExpect(jsonPath("$.averageOverallRating").value(4.40))
        .andExpect(jsonPath("$.trendByQuarter").isArray())
        .andExpect(jsonPath("$.averageByFeedbackType.MANAGER").exists());
  }

  @Test
  @WithMockUser(roles = "EMPLOYEE")
  void employeeCannotCreateReview() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/performance/reviews")
                .with(TENANT_ONE)
                .contentType(APPLICATION_JSON)
                .content(
                    """
                                {
                                  "employeeId": 1,
                                  "reviewYear": 2026,
                                  "reviewQuarter": 1
                                }
                                """))
        .andExpect(status().isForbidden());
  }

  private static long feedbackIdForType(JsonNode feedbackNodes, String type) {
    for (JsonNode node : feedbackNodes) {
      if (type.equals(node.get("feedbackType").asText())) {
        return node.get("id").asLong();
      }
    }
    throw new IllegalStateException("Feedback type not found: " + type);
  }
}
