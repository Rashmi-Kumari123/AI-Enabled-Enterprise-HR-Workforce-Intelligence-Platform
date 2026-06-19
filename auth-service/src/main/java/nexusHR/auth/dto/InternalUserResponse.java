package nexusHR.auth.dto;
import java.util.Set;
public record InternalUserResponse(Long id, String email, Set<String> roles, boolean enabled) {}
