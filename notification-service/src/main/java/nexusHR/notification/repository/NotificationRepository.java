package nexusHR.notification.repository;
import java.util.List;
import java.util.Optional;
import nexusHR.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop20ByTenantIdAndRecipientEmailOrderByCreatedAtDesc(
            Long tenantId, String recipientEmail);

    long countByTenantIdAndRecipientEmailAndReadFalse(Long tenantId, String recipientEmail);

    Optional<Notification> findByIdAndTenantId(Long id, Long tenantId);

    @Modifying
    @Query(
            "update Notification n set n.read = true where n.id = :id and n.tenantId = :tenantId and n.recipientEmail = :email")
    int markRead(@Param("id") Long id, @Param("tenantId") Long tenantId, @Param("email") String email);

    @Modifying
    @Query(
            "update Notification n set n.read = true where n.tenantId = :tenantId and n.recipientEmail = :email and n.read = false")
    int markAllRead(@Param("tenantId") Long tenantId, @Param("email") String email);
}
