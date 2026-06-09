package nexusHR.notification.repository;
import java.util.List;
import nexusHR.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop20ByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    long countByRecipientEmailAndReadFalse(String recipientEmail);

    @Modifying
    @Query("update Notification n set n.read = true where n.id = :id and n.recipientEmail = :email")
    int markRead(@Param("id") Long id, @Param("email") String email);

    @Modifying
    @Query("update Notification n set n.read = true where n.recipientEmail = :email and n.read = false")
    int markAllRead(@Param("email") String email);
}
