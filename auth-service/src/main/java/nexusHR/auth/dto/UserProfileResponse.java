package nexusHR.auth.dto;
import java.util.Set;
public record UserProfileResponse(Long id, String email, Set<String> roles, boolean enabled) {}
