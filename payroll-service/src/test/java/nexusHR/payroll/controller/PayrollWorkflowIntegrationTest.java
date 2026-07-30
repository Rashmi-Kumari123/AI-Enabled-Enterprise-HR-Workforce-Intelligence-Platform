package nexusHR.payroll.controller;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import nexusHR.common.tenant.TenantHeaders;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class PayrollWorkflowIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "HR")
    void configureSalaryGeneratePayslipAndDownloadPdf() throws Exception {
        mockMvc.perform(put("/api/v1/payroll/salary-structures")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "baseSalary": 50000.00,
                                  "hraPercent": 40,
                                  "transportAllowance": 2000,
                                  "otherAllowance": 1000
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(1))
                .andExpect(jsonPath("$.baseSalary").value(50000.00));

        MvcResult generate = mockMvc.perform(post("/api/v1/payroll/payslips/generate")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "employeeCode": "EMP001",
                                  "employeeName": "Rashmi Kumari",
                                  "payYear": 2026,
                                  "payMonth": 6,
                                  "workingDays": 22,
                                  "unpaidLeaveDays": 1
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.grossPay").value(73000.00))
                .andExpect(jsonPath("$.netPay").exists())
                .andExpect(jsonPath("$.payslipNumber").value("PS-202606-1"))
                .andReturn();

        JsonNode payslip = objectMapper.readTree(generate.getResponse().getContentAsString());
        long payslipId = payslip.get("id").asLong();

        mockMvc.perform(get("/api/v1/payroll/payslips/" + payslipId)
                        .header(TenantHeaders.TENANT_ID, "1")
                        .with(user("employee@nexushr.com").roles("EMPLOYEE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeName").value("Rashmi Kumari"));

        mockMvc.perform(get("/api/v1/payroll/payslips/" + payslipId + "/download")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .with(user("employee@nexushr.com").roles("EMPLOYEE")))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("PS-202606-1.pdf")));

        mockMvc.perform(post("/api/v1/payroll/payslips/generate")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 1,
                                  "employeeCode": "EMP001",
                                  "employeeName": "Rashmi Kumari",
                                  "payYear": 2026,
                                  "payMonth": 6
                                }
                                """))
                .andExpect(status().isConflict());
    }
    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void employeeCannotConfigureSalary() throws Exception {
        mockMvc.perform(put("/api/v1/payroll/salary-structures")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": 2,
                                  "baseSalary": 30000
                                }
                                """))
                .andExpect(status().isForbidden());
    }
}
