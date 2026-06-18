package nexusHR.employee.dto;
import java.time.Instant;
public record EmployeeDocumentResponse(
        Long id,
        Long employeeId,
        String originalFileName,
        String contentType,
        long fileSize,
        String documentType,
        Instant uploadedAt) {}
