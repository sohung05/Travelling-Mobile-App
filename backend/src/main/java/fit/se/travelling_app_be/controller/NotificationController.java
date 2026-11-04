package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.model.Notification;
import fit.se.travelling_app_be.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }
    
    @PutMapping("/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }
}

