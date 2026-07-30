package nexusHR.insights.controller;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.fasterxml.jackson.databind.ObjectMapper;
import nexusHR.common.tenant.TenantHeaders;
import nexusHR.insights.dto.CreateReportScheduleRequest;
import nexusHR.insights.enums.ReportFormat;
import nexusHR.insights.enums.ReportFrequency;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
@SpringBootTest
@AutoConfigureMockMvc
class WorkforceReportControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "hr@nexushr.com", roles = "HR")
    void hrCanExportPdfExcelAndScheduleReports() throws Exception {
        mockMvc.perform(get("/api/v1/ai/reports/export/pdf")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .with(user("hr@nexushr.com").roles("HR")))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString(".pdf")));

        mockMvc.perform(get("/api/v1/ai/reports/export/excel")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .with(user("hr@nexushr.com").roles("HR")))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString(".xlsx")));

        CreateReportScheduleRequest request =
                new CreateReportScheduleRequest("hr@nexushr.com", ReportFrequency.WEEKLY, ReportFormat.PDF);
        MvcResult createResult = mockMvc.perform(post("/api/v1/ai/reports/schedules")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .with(user("hr@nexushr.com").roles("HR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recipientEmail").value("hr@nexushr.com"))
                .andExpect(jsonPath("$.frequency").value("WEEKLY"))
                .andReturn();

        long id = objectMapper
                .readTree(createResult.getResponse().getContentAsString())
                .path("id")
                .asLong();

        mockMvc.perform(get("/api/v1/ai/reports/schedules")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .with(user("hr@nexushr.com").roles("HR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id));

        mockMvc.perform(post("/api/v1/ai/reports/schedules/" + id + "/run-now")
                        .header(TenantHeaders.TENANT_ID, "1")
                        .with(user("hr@nexushr.com").roles("HR")))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/v1/ai/reports/schedules/" + id)
                        .header(TenantHeaders.TENANT_ID, "1")
                        .with(user("hr@nexushr.com").roles("HR")))
                .andExpect(status().isNoContent());
    }
    @Test
    @WithMockUser(roles = "MANAGER")
    void managerCannotScheduleReports() throws Exception {
        mockMvc.perform(get("/api/v1/ai/reports/export/pdf")).andExpect(status().isForbidden());
    }
}
