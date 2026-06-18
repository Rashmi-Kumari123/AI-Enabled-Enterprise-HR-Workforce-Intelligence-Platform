package nexusHR.payroll.dto;
public record NotificationDispatchPayload(
        String audience,
        String recipientEmail,
        String title,
        String message,
        String type,
        String referenceType,
        Long referenceId) {}
