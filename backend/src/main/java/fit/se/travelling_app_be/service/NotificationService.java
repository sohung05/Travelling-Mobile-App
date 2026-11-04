package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.model.Notification;
import fit.se.travelling_app_be.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    
    public Notification createNotification(String userId, String title, String message, 
                                          String type, String relatedId) {
        return createNotification(userId, title, message, type, relatedId, null);
    }
    
    public Notification createNotification(String userId, String title, String message, 
                                          String type, String relatedId, String reminderType) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRelatedId(relatedId);
        notification.setReminderType(reminderType);
        
        return notificationRepository.save(notification);
    }
    
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
    
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
    
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }
}

