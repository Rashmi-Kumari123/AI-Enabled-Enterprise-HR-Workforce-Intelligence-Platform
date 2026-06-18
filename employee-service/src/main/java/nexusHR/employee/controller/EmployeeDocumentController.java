package nexusHR.employee.controller;
import java.util.List;
import lombok.RequiredArgsConstructor;
import nexusHR.employee.dto.EmployeeDocumentResponse;
import nexusHR.employee.service.EmployeeDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeDocumentController {
    private final EmployeeDocumentService documentService;
    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public List<EmployeeDocumentResponse> listDocuments(@PathVariable Long id, Authentication authentication) {
        return documentService.listForEmployee(id, authentication.getName(), isPrivileged(authentication));
    }
    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN')")
    public EmployeeDocumentResponse uploadDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", defaultValue = "IDENTITY") String documentType,
            Authentication authentication) {
        return documentService.upload(id, file, documentType, authentication.getName(), isPrivileged(authentication));
    }
    @GetMapping("/{id}/documents/{documentId}/download")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id, @PathVariable Long documentId, Authentication authentication) {
        Resource resource = documentService.loadAsResource(id, documentId, authentication.getName(), isPrivileged(authentication));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
    private static boolean isPrivileged(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_HR") || role.equals("ROLE_ADMIN"));
    }
}
