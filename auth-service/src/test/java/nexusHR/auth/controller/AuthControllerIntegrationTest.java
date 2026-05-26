package nexusHR.auth.controller;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void signupLoginRefreshLogoutAndMe() throws Exception {
        String email = "day3.user@nexushr.com";
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "Password123!",
                                  "firstName": "Day",
                                  "lastName": "Three"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.roles[0]").value("ROLE_EMPLOYEE"));

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "password": "Password123!"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String accessToken = loginJson.get("accessToken").asText();
        String refreshToken = loginJson.get("refreshToken").asText();

        mockMvc.perform(get("/api/v1/users/me").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"refreshToken": "%s"}
                                """.formatted(refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"refreshToken": "%s"}
                                """.formatted(refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }
    @Test
    void employeeCannotAccessHrDashboardWithoutRole() throws Exception {
        String email = "employee.only@nexushr.com";

        MvcResult signup = mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "Password123!",
                                  "firstName": "Emp",
                                  "lastName": "Only"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn();

        String accessToken =
                objectMapper.readTree(signup.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(get("/api/v1/users/hr/dashboard").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isForbidden());
    }
}
