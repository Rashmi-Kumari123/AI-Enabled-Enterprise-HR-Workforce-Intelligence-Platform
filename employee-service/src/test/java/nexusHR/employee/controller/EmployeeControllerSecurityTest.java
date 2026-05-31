package nexusHR.employee.controller;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class EmployeeControllerSecurityTest {
    @Autowired
    private MockMvc mockMvc;
    @Test
    @WithMockUser(roles = "HR")
    void hrCanCreateEmployee() throws Exception {
        mockMvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": 1,
                                  "employeeCode": "EMP-2026-001",
                                  "firstName": "Rashmi",
                                  "lastName": "Kumari",
                                  "email": "rashmi@nexushr.com",
                                  "phone": "9876543210",
                                  "departmentId": 1,
                                  "hireDate": "2026-05-01",
                                  "employmentStatus": "ACTIVE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeCode").value("EMP-2026-001"));
    }
    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeCannotCreateEmployee() throws Exception {
        mockMvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": 2,
                                  "employeeCode": "EMP-2026-002",
                                  "firstName": "Test",
                                  "lastName": "User",
                                  "email": "test@nexushr.com",
                                  "hireDate": "2026-05-01"
                                }
                                """))
                .andExpect(status().isForbidden());
    }
    @Test
    @WithMockUser(roles = "MANAGER")
    void managerCanListEmployees() throws Exception {
        mockMvc.perform(get("/api/v1/employees")).andExpect(status().isOk());
    }
    @Test
    @WithMockUser(roles = "HR")
    void hrCanDeleteEmployee() throws Exception {
        var createResult = mockMvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": 99,
                                  "employeeCode": "EMP-DELETE-001",
                                  "firstName": "Delete",
                                  "lastName": "Me",
                                  "email": "delete@nexushr.com",
                                  "hireDate": "2026-05-01"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        String body = createResult.getResponse().getContentAsString();
        Number id = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        mockMvc.perform(delete("/api/v1/employees/" + id.longValue())).andExpect(status().isNoContent());
    }
}
