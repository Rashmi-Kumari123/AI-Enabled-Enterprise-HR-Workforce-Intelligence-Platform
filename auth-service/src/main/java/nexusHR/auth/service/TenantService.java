package nexusHR.auth.service;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.entity.Organization;
import nexusHR.auth.exception.ApiException;
import nexusHR.auth.repository.OrganizationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class TenantService {
    private final OrganizationRepository organizationRepository;
    @Transactional(readOnly = true)
    public Organization requireBySlug(String slug) {
        return organizationRepository
                .findBySlugIgnoreCase(slug.trim())
                .filter(org -> "ACTIVE".equalsIgnoreCase(org.getStatus()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Organization not found"));
    }
    @Transactional(readOnly = true)
    public Organization requireById(Long tenantId) {
        return organizationRepository
                .findById(tenantId)
                .filter(org -> "ACTIVE".equalsIgnoreCase(org.getStatus()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Organization not found"));
    }
}
