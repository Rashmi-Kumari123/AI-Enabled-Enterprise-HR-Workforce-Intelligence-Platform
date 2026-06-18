package nexusHR.leave.controller;
import lombok.RequiredArgsConstructor;
import nexusHR.leave.exception.ApiException;
import nexusHR.leave.service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/v1/leaves/internal")
@RequiredArgsConstructor
public class LeaveInternalController {
    private final LeaveBalanceService leaveBalanceService;

    @Value("${app.leave.internal-key:nexushr-internal-dev-key}")
    private String internalKey;

    @PostMapping("/balances/seed/{employeeId}")
    public void seedBalances(
            @RequestHeader("X-Internal-Key") String key, @PathVariable Long employeeId) {
        validateInternalKey(key);
        leaveBalanceService.seedBalancesForEmployee(employeeId);
    }
    @GetMapping("/unpaid-days/{employeeId}")
    public Map<String, Integer> unpaidLeaveDays(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable Long employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        validateInternalKey(key);
        int days = leaveBalanceService.countUnpaidLeaveDays(employeeId, year, month);
        return Map.of("unpaidLeaveDays", days);
    }
    private void validateInternalKey(String key) {
        if (!internalKey.equals(key)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid internal key");
        }
    }
}
