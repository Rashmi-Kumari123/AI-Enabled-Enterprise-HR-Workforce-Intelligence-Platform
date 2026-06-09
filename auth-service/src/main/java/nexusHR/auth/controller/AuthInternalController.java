package nexusHR.auth.controller;
import lombok.RequiredArgsConstructor;
import nexusHR.auth.exception.ApiException;
import nexusHR.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/internal")
@RequiredArgsConstructor
public class AuthInternalController {
    private final UserRepository userRepository;

    @Value("${app.auth.internal-key:nexushr-internal-dev-key}")
    private String internalKey;

    @PostMapping("/users/{userId}/disable")
    public void disableUser(@RequestHeader("X-Internal-Key") String key, @PathVariable Long userId) {
        if (!internalKey.equals(key)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid internal key");
        }
        var user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setEnabled(false);
        userRepository.save(user);
    }
}
