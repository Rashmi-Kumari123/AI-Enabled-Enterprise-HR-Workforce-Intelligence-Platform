package nexusHR.payroll.controller;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.payroll.dto.GeneratePayslipRequest;
import nexusHR.payroll.dto.PayslipResponse;
import nexusHR.payroll.dto.SalaryStructureRequest;
import nexusHR.payroll.dto.SalaryStructureResponse;
import nexusHR.payroll.service.PayrollService;
import nexusHR.payroll.service.SalaryStructureService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payroll")
@RequiredArgsConstructor
public class PayrollController {
    private final SalaryStructureService salaryStructureService;
    private final PayrollService payrollService;
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "payroll-service");
    }
    @PutMapping("/salary-structures")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public SalaryStructureResponse upsertSalaryStructure(@Valid @RequestBody SalaryStructureRequest request) {
        return salaryStructureService.upsert(request);
    }
    @GetMapping("/salary-structures")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public List<SalaryStructureResponse> listSalaryStructures() {
        return salaryStructureService.findAll();
    }
    @GetMapping("/salary-structures/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public SalaryStructureResponse getSalaryStructure(@PathVariable Long employeeId) {
        return salaryStructureService.findByEmployeeId(employeeId);
    }
    @PostMapping("/payslips/generate")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public PayslipResponse generatePayslip(
            @Valid @RequestBody GeneratePayslipRequest request, Authentication authentication) {
        return payrollService.generatePayslip(request, authentication.getName());
    }
    @GetMapping("/payslips/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public PayslipResponse getPayslip(@PathVariable Long id) {
        return payrollService.findById(id);
    }
    @GetMapping("/payslips/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public List<PayslipResponse> listPayslipsByEmployee(@PathVariable Long employeeId) {
        return payrollService.findByEmployee(employeeId);
    }
    @GetMapping("/payslips/{id}/download")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long id) {
        PayslipResponse payslip = payrollService.findById(id);
        byte[] pdf = payrollService.downloadPayslipPdf(id);
        String filename = payslip.payslipNumber() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
    @PostMapping("/payslips/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public PayslipResponse markPaid(@PathVariable Long id) {
        return payrollService.markPaid(id);
    }
}
