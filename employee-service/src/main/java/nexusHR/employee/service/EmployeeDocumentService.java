package nexusHR.employee.service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import nexusHR.employee.dto.EmployeeDocumentResponse;
import nexusHR.employee.entity.Employee;
import nexusHR.employee.entity.EmployeeDocument;
import nexusHR.employee.exception.ApiException;
import nexusHR.employee.repository.EmployeeDocumentRepository;
import nexusHR.employee.repository.EmployeeRepository;
import nexusHR.employee.repository.OnboardingTaskRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
@Service
@RequiredArgsConstructor
public class EmployeeDocumentService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final OnboardingTaskRepository onboardingTaskRepository;
    @Lazy
    private final EmployeeLifecycleService employeeLifecycleService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<EmployeeDocumentResponse> listForEmployee(Long employeeId, String requesterEmail, boolean privileged) {
        Employee employee = getEmployee(employeeId);
        assertCanAccess(employee, requesterEmail, privileged);
        return documentRepository.findByEmployeeIdOrderByUploadedAtDesc(employeeId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EmployeeDocumentResponse upload(
            Long employeeId, MultipartFile file, String documentType, String requesterEmail, boolean privileged) {
        Employee employee = getEmployee(employeeId);
        assertCanAccess(employee, requesterEmail, privileged);

        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File exceeds 10 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported file type. Upload PDF or image files.");
        }

        String originalName = sanitizeFilename(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + "_" + originalName;
        Path targetDir = Path.of(uploadDir, "employees", employeeId.toString());
        Path targetFile = targetDir.resolve(storedName);

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store document");
        }

        EmployeeDocument document = new EmployeeDocument();
        document.setEmployeeId(employeeId);
        document.setStoredFileName(storedName);
        document.setOriginalFileName(originalName);
        document.setContentType(contentType);
        document.setFileSize(file.getSize());
        document.setDocumentType(documentType != null && !documentType.isBlank() ? documentType.trim() : "GENERAL");
        EmployeeDocument saved = documentRepository.save(document);

        if ("IDENTITY".equalsIgnoreCase(saved.getDocumentType())
                || "TAX".equalsIgnoreCase(saved.getDocumentType())
                || "GENERAL".equalsIgnoreCase(saved.getDocumentType())) {
            completeDocumentsTaskIfNeeded(employeeId);
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Resource loadAsResource(Long employeeId, Long documentId, String requesterEmail, boolean privileged) {
        Employee employee = getEmployee(employeeId);
        assertCanAccess(employee, requesterEmail, privileged);

        EmployeeDocument document = documentRepository
                .findById(documentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found"));
        if (!document.getEmployeeId().equals(employeeId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Document not found");
        }
        try {
            Path file = Path.of(uploadDir, "employees", employeeId.toString(), document.getStoredFileName());
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Document file missing on disk");
            }
            return resource;
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read document");
        }
    }
    private void completeDocumentsTaskIfNeeded(Long employeeId) {
        onboardingTaskRepository.findByEmployeeIdOrderByCreatedAtAsc(employeeId).stream()
                .filter(task -> "DOCUMENTS".equals(task.getTaskCode()) && !task.isCompleted())
                .findFirst()
                .ifPresent(task -> employeeLifecycleService.completeTask(employeeId, task.getId()));
    }
    private void assertCanAccess(Employee employee, String requesterEmail, boolean privileged) {
        if (privileged) {
            return;
        }
        boolean ownsProfile = employee.getEmail().equalsIgnoreCase(requesterEmail.trim());
        if (!ownsProfile) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage documents for your own profile");
        }
    }
    private Employee getEmployee(Long employeeId) {
        return employeeRepository
                .findById(employeeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));
    }
    private static String sanitizeFilename(String name) {
        if (name == null || name.isBlank()) {
            return "document.bin";
        }
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
    private EmployeeDocumentResponse toResponse(EmployeeDocument document) {
        return new EmployeeDocumentResponse(
                document.getId(),
                document.getEmployeeId(),
                document.getOriginalFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getDocumentType(),
                document.getUploadedAt());
    }
}
