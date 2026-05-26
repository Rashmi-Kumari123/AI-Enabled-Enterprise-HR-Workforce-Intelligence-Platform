package nexusHR.auth.controller;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerSecurityTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeCannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "HR")
    void hrCanAccessDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/users/hr/dashboard")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeCannotAccessHrDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/users/hr/dashboard")).andExpect(status().isForbidden());
    }
}
