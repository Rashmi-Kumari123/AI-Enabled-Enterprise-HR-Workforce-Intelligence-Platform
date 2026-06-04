package nexusHR.performance.controller;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import nexusHR.performance.dto.CreateReviewRequest;
import nexusHR.performance.dto.ReviewResponse;
import nexusHR.performance.dto.ScorecardResponse;
import nexusHR.performance.dto.SetRatingsRequest;
import nexusHR.performance.dto.UpdateReviewRequest;
import nexusHR.performance.service.PerformanceReviewService;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/v1/performance")
@RequiredArgsConstructor
public class PerformanceController {
    private final PerformanceReviewService performanceReviewService;
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "performance-service");
    }
    @PostMapping("/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public ReviewResponse create(@Valid @RequestBody CreateReviewRequest request, Authentication authentication) {
        return performanceReviewService.create(request, authentication.getName());
    }
    @PutMapping("/reviews/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public ReviewResponse update(@PathVariable Long id, @Valid @RequestBody UpdateReviewRequest request) {
        return performanceReviewService.update(id, request);
    }
    @PutMapping("/reviews/{id}/ratings")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public ReviewResponse setRatings(@PathVariable Long id, @Valid @RequestBody SetRatingsRequest request) {
        return performanceReviewService.setRatings(id, request);
    }
    @PostMapping("/reviews/{id}/submit")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'MANAGER')")
    public ReviewResponse submit(@PathVariable Long id) {
        return performanceReviewService.submit(id);
    }
    @PostMapping("/reviews/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public ReviewResponse acknowledge(@PathVariable Long id) {
        return performanceReviewService.acknowledge(id);
    }
    @GetMapping("/reviews/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public ReviewResponse getById(@PathVariable Long id) {
        return performanceReviewService.findById(id);
    }
    @GetMapping("/reviews/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public List<ReviewResponse> listByEmployee(@PathVariable Long employeeId) {
        return performanceReviewService.findByEmployee(employeeId);
    }
    @GetMapping("/reviews/employee/{employeeId}/scorecard")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'HR', 'ADMIN', 'MANAGER')")
    public ScorecardResponse scorecard(@PathVariable Long employeeId) {
        return performanceReviewService.scorecard(employeeId);
    }
}
