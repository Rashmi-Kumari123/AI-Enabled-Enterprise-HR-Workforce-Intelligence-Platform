package nexusHR.auth.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
public record TenantRegisterRequest(
        @NotBlank @Size(max = 255) String companyName,
        @NotBlank
                @Pattern(regexp = "^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$", message = "Slug must be lowercase alphanumeric")
                String slug,
        @NotBlank @Email String adminEmail,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 128) String firstName,
        @NotBlank @Size(max = 128) String lastName) {}
