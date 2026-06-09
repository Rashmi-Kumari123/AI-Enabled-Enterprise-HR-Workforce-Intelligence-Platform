package nexusHR.notification.repository;
import java.time.Instant;
import java.util.List;
import nexusHR.notification.entity.NotificationDelivery;
import nexusHR.notification.enums.NotificationChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, Long> {
    List<NotificationDelivery> findByNotificationIdOrderByCreatedAtAsc(Long notificationId);

    @Query("""
            SELECT COUNT(d) FROM NotificationDelivery d
            WHERE d.notification.referenceType = :referenceType
              AND d.notification.referenceId = :referenceId
              AND d.notification.type = nexusHR.notification.enums.NotificationType.APPROVAL_REMINDER
              AND d.channel = :channel
              AND d.status = nexusHR.notification.enums.DeliveryStatus.SENT
              AND d.createdAt >= :since
            """)
    long countRecentReminders(
            @Param("referenceType") String referenceType,
            @Param("referenceId") Long referenceId,
            @Param("channel") NotificationChannel channel,
            @Param("since") Instant since);

    @Query("""
            SELECT d.channel, d.status, COUNT(d)
            FROM NotificationDelivery d
            GROUP BY d.channel, d.status
            """)
    List<Object[]> aggregateDeliveryStats();
}
