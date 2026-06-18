package nexusHR.insights.service;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import nexusHR.insights.dto.DepartmentAnalytics;
import nexusHR.insights.dto.WorkforceAnalyticsResponse;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

@Component
public class WorkforceReportExporter {
    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font HEADING_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 11);
    private static final DateTimeFormatter STAMP =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm 'UTC'").withZone(ZoneOffset.UTC);

    public byte[] toCsv(WorkforceAnalyticsResponse analytics) {
        List<String> lines = new ArrayList<>();
        lines.add("NexusHR Workforce Analytics Export");
        lines.add("Generated," + STAMP.format(Instant.now()));
        lines.add("");
        lines.add("Metric,Value");
        lines.add("Total Employees," + analytics.totalEmployees());
        lines.add("Active Employees," + analytics.activeEmployees());
        lines.add("Inactive Employees," + analytics.inactiveEmployees());
        lines.add("Departments," + analytics.departmentCount());
        lines.add("Pending Leave Requests," + analytics.pendingLeaveRequests());
        lines.add("Average Engagement Score," + String.format("%.1f", analytics.averageEngagementScore()));
        lines.add("High Attrition Risk," + analytics.highAttritionRisk());
        lines.add("Medium Attrition Risk," + analytics.mediumAttritionRisk());
        lines.add("Employees With Skill Gaps," + analytics.employeesWithSkillGaps());
        lines.add("Total Skill Gaps," + analytics.totalSkillGaps());
        lines.add("");
        lines.add("Department,Employees,Active");
        for (DepartmentAnalytics dept : analytics.departmentBreakdown()) {
            lines.add(csv(dept.department()) + "," + dept.employeeCount() + "," + dept.activeCount());
        }
        if (!analytics.topAttritionRisks().isEmpty()) {
            lines.add("");
            lines.add("Employee,Risk Score,Level");
            analytics.topAttritionRisks().forEach(risk -> lines.add(
                    csv(risk.employeeName()) + "," + risk.riskScore() + "," + risk.riskLevel()));
        }
        return String.join("\n", lines).getBytes(StandardCharsets.UTF_8);
    }

    public byte[] toExcel(WorkforceAnalyticsResponse analytics) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet summary = workbook.createSheet("Summary");
            int rowIdx = 0;
            rowIdx = writePair(summary, rowIdx, "Generated", STAMP.format(Instant.now()));
            rowIdx = writePair(summary, rowIdx, "Total Employees", String.valueOf(analytics.totalEmployees()));
            rowIdx = writePair(summary, rowIdx, "Active Employees", String.valueOf(analytics.activeEmployees()));
            rowIdx = writePair(summary, rowIdx, "Inactive Employees", String.valueOf(analytics.inactiveEmployees()));
            rowIdx = writePair(summary, rowIdx, "Departments", String.valueOf(analytics.departmentCount()));
            rowIdx = writePair(summary, rowIdx, "Pending Leave", String.valueOf(analytics.pendingLeaveRequests()));
            rowIdx = writePair(
                    summary,
                    rowIdx,
                    "Avg Engagement",
                    String.format("%.1f", analytics.averageEngagementScore()));
            rowIdx = writePair(summary, rowIdx, "High Attrition Risk", String.valueOf(analytics.highAttritionRisk()));
            rowIdx = writePair(summary, rowIdx, "Medium Attrition Risk", String.valueOf(analytics.mediumAttritionRisk()));
            rowIdx = writePair(
                    summary, rowIdx, "Employees With Skill Gaps", String.valueOf(analytics.employeesWithSkillGaps()));
            writePair(summary, rowIdx, "Total Skill Gaps", String.valueOf(analytics.totalSkillGaps()));

            Sheet departments = workbook.createSheet("Departments");
            Row header = departments.createRow(0);
            header.createCell(0).setCellValue("Department");
            header.createCell(1).setCellValue("Employees");
            header.createCell(2).setCellValue("Active");
            int deptRow = 1;
            for (DepartmentAnalytics dept : analytics.departmentBreakdown()) {
                Row row = departments.createRow(deptRow++);
                row.createCell(0).setCellValue(dept.department());
                row.createCell(1).setCellValue(dept.employeeCount());
                row.createCell(2).setCellValue(dept.activeCount());
            }

            if (!analytics.topAttritionRisks().isEmpty()) {
                Sheet risks = workbook.createSheet("Attrition Risks");
                Row riskHeader = risks.createRow(0);
                riskHeader.createCell(0).setCellValue("Employee");
                riskHeader.createCell(1).setCellValue("Risk Score");
                riskHeader.createCell(2).setCellValue("Level");
                int riskRow = 1;
                for (var risk : analytics.topAttritionRisks()) {
                    Row row = risks.createRow(riskRow++);
                    row.createCell(0).setCellValue(risk.employeeName());
                    row.createCell(1).setCellValue(risk.riskScore());
                    row.createCell(2).setCellValue(risk.riskLevel().name());
                }
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to generate Excel report", ex);
        }
    }
    public byte[] toPdf(WorkforceAnalyticsResponse analytics) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 48, 48, 56, 56);
            PdfWriter.getInstance(document, output);
            document.open();
            document.add(new Paragraph("NexusHR Workforce Analytics Report", TITLE_FONT));
            document.add(new Paragraph("Generated: " + STAMP.format(Instant.now()), BODY_FONT));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Organization summary", HEADING_FONT));
            document.add(new Paragraph("Total employees: " + analytics.totalEmployees(), BODY_FONT));
            document.add(new Paragraph("Active employees: " + analytics.activeEmployees(), BODY_FONT));
            document.add(new Paragraph("Inactive employees: " + analytics.inactiveEmployees(), BODY_FONT));
            document.add(new Paragraph("Departments: " + analytics.departmentCount(), BODY_FONT));
            document.add(new Paragraph("Pending leave requests: " + analytics.pendingLeaveRequests(), BODY_FONT));
            document.add(new Paragraph(
                    "Average engagement score: "
                            + String.format("%.1f", analytics.averageEngagementScore()),
                    BODY_FONT));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Risk & skills", HEADING_FONT));
            document.add(new Paragraph("High attrition risk: " + analytics.highAttritionRisk(), BODY_FONT));
            document.add(new Paragraph("Medium attrition risk: " + analytics.mediumAttritionRisk(), BODY_FONT));
            document.add(new Paragraph("Employees with skill gaps: " + analytics.employeesWithSkillGaps(), BODY_FONT));
            document.add(new Paragraph("Total skill gaps: " + analytics.totalSkillGaps(), BODY_FONT));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Department breakdown", HEADING_FONT));
            for (DepartmentAnalytics dept : analytics.departmentBreakdown()) {
                document.add(new Paragraph(
                        dept.department() + " — " + dept.employeeCount() + " employees (" + dept.activeCount()
                                + " active)",
                        BODY_FONT));
            }
            if (!analytics.topAttritionRisks().isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Top attrition risks", HEADING_FONT));
                analytics.topAttritionRisks().forEach(risk -> {
                    try {
                        document.add(new Paragraph(
                                risk.employeeName() + " — score " + risk.riskScore() + " (" + risk.riskLevel() + ")",
                                BODY_FONT));
                    } catch (DocumentException ex) {
                        throw new IllegalStateException(ex);
                    }
                });
            }
            document.close();
            return output.toByteArray();
        } catch (DocumentException | IOException ex) {
            throw new IllegalStateException("Failed to generate PDF report", ex);
        }
    }
    public String buildEmailBody(WorkforceAnalyticsResponse analytics) {
        StringBuilder body = new StringBuilder();
        body.append("NexusHR scheduled workforce analytics report\n\n");
        body.append("Generated: ").append(STAMP.format(Instant.now())).append("\n\n");
        body.append("Headcount: ").append(analytics.totalEmployees()).append(" total / ")
                .append(analytics.activeEmployees())
                .append(" active\n");
        body.append("Engagement index: ")
                .append(String.format("%.1f", analytics.averageEngagementScore()))
                .append(" / 100\n");
        body.append("Attrition risk: ")
                .append(analytics.highAttritionRisk())
                .append(" high, ")
                .append(analytics.mediumAttritionRisk())
                .append(" medium\n");
        body.append("Skill gaps: ")
                .append(analytics.totalSkillGaps())
                .append(" across ")
                .append(analytics.employeesWithSkillGaps())
                .append(" employees\n");
        body.append("Pending leave requests: ").append(analytics.pendingLeaveRequests()).append("\n\n");
        body.append("Open NexusHR → Analytics to export PDF/Excel/CSV on demand.");
        return body.toString();
    }
    private static int writePair(Sheet sheet, int rowIdx, String label, String value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
        return rowIdx + 1;
    }
    private static String csv(String value) {
        if (value.contains(",") || value.contains("\"")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
