package nexusHR.payroll.service;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;
import nexusHR.payroll.entity.Payslip;
import org.springframework.stereotype.Component;

@Component
public class PayslipPdfGenerator {
    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font HEADING_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 11);
    public byte[] generate(Payslip payslip) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 48, 48, 56, 56);
            PdfWriter.getInstance(document, output);
            document.open();

            document.add(new Paragraph("NexusHR — Payslip", TITLE_FONT));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Payslip: " + payslip.getPayslipNumber(), BODY_FONT));
            document.add(new Paragraph(
                    "Period: "
                            + Month.of(payslip.getPayMonth())
                                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                            + " "
                            + payslip.getPayYear(),
                    BODY_FONT));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Employee details", HEADING_FONT));
            document.add(new Paragraph("Code: " + payslip.getEmployeeCode(), BODY_FONT));
            document.add(new Paragraph("Name: " + payslip.getEmployeeName(), BODY_FONT));
            document.add(new Paragraph("Employee ID: " + payslip.getEmployeeId(), BODY_FONT));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Earnings", HEADING_FONT));
            document.add(line("Base salary", payslip.getBaseSalary(), payslip.getCurrency()));
            document.add(line("HRA", payslip.getHraAmount(), payslip.getCurrency()));
            document.add(line("Transport allowance", payslip.getTransportAllowance(), payslip.getCurrency()));
            document.add(line("Other allowance", payslip.getOtherAllowance(), payslip.getCurrency()));
            document.add(line("Gross pay", payslip.getGrossPay(), payslip.getCurrency()));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Deductions", HEADING_FONT));
            document.add(line("Provident fund (PF)", payslip.getPfDeduction(), payslip.getCurrency()));
            document.add(line("Professional tax", payslip.getProfessionalTax(), payslip.getCurrency()));
            document.add(line("Income tax (TDS)", payslip.getIncomeTax(), payslip.getCurrency()));
            document.add(
                    line("Unpaid leave (" + payslip.getUnpaidLeaveDays() + " days)", payslip.getLeaveDeduction(), payslip.getCurrency()));
            document.add(line("Total deductions", payslip.getTotalDeductions(), payslip.getCurrency()));
            document.add(new Paragraph(" "));
            document.add(line("Net pay", payslip.getNetPay(), payslip.getCurrency()));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Status: " + payslip.getStatus(), BODY_FONT));
            document.add(new Paragraph("Generated at: " + payslip.getGeneratedAt(), BODY_FONT));

            document.close();
            return output.toByteArray();
        } catch (DocumentException | IOException ex) {
            throw new IllegalStateException("Failed to generate payslip PDF", ex);
        }
    }
    private static Paragraph line(String label, java.math.BigDecimal amount, String currency) {
        return new Paragraph(label + ": " + currency + " " + amount, BODY_FONT);
    }
}
