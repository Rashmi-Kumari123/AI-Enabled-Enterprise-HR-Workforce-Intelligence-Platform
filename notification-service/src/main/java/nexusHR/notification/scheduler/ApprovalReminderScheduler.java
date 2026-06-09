package nexusHR.notification.scheduler;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nexusHR.notification.dto.DispatchNotificationRequest;
import nexusHR.notification.dto.PendingLeaveSnapshot;
import nexusHR.notification.enums.NotificationAudience;
import nexusHR.notification.enums.NotificationChannel;
import nexusHR.notification.enums.NotificationType;
import nexusHR.notification.integration.LeaveServiceClient;
import nexusHR.notification.repository.NotificationDeliveryRepository;
import nexusHR.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
@Slf4j
@Component
@RequiredArgsConstructor
public class ApprovalReminderScheduler {
    private final LeaveServiceClient leaveServiceClient;
    private final NotificationService notificationService;
    private final NotificationDeliveryRepository notificationDeliveryRepository;
    @Value("${app.notifications.reminders.enabled:true}")
    private boolean remindersEnabled;
    @Value("${app.notifications.reminders.pending-hours:24}")
    private long pendingHours;
    @Scheduled(cron = "${app.notifications.reminders.cron:0 0 9 * * *}")
    public void sendPendingApprovalReminders() {
        if (!remindersEnabled) {
            return;
        }
        Instant cutoff = Instant.now().minus(Duration.ofHours(pendingHours));
        List<PendingLeaveSnapshot> pendingLeaves = leaveServiceClient.fetchPendingLeaves().stream()
                .filter(leave -> leave.submittedAt() != null && leave.submittedAt().isBefore(cutoff)).toList();
        for (PendingLeaveSnapshot leave : pendingLeaves) {
            if (wasRecentlyReminded(leave.id())) {
                continue;
            }
            String title = "Pending leave approval reminder";
            String message = "Leave request #"
                    + leave.id()
                    + " for employee "
                    + leave.employeeId()
                    + " has been pending for over "
                    + pendingHours
                    + " hours. Please review and approve or reject.";

            notificationService.dispatch(new DispatchNotificationRequest(
                    NotificationAudience.MANAGERS,
                    null,
                    null,
                    title,
                    message,
                    NotificationType.APPROVAL_REMINDER,
                    "LEAVE",
                    leave.id()));

            if (leave.employeeEmail() != null) {
                notificationService.dispatch(new DispatchNotificationRequest(
                        NotificationAudience.USER,
                        leave.employeeEmail(),
                        leave.employeePhone(),
                        "Leave approval pending",
                        "Your leave request (#" + leave.id() + ") is still awaiting manager approval.",
                        NotificationType.APPROVAL_REMINDER,
                        "LEAVE",
                        leave.id()));
            }
            log.info("Sent approval reminder for leave #{}", leave.id());
        }
    }
    private boolean wasRecentlyReminded(Long leaveId) {
        Instant since = Instant.now().minus(Duration.ofHours(pendingHours));
        return notificationDeliveryRepository.countRecentReminders("LEAVE", leaveId, NotificationChannel.EMAIL, since)  > 0;
    }
}
