package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.model.Notification;
import fit.se.travelling_app_be.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;
    private String testNotificationId;
    private String testUserId;

    @BeforeEach
    void setUp() {
        testNotificationId = "test-notification-id";
        testUserId = "test-user-id";

        testNotification = new Notification();
        testNotification.setId(testNotificationId);
        testNotification.setUserId(testUserId);
        testNotification.setTitle("Test Notification");
        testNotification.setMessage("Test message");
        testNotification.setType("booking");
        testNotification.setRead(false);
        testNotification.setRelatedId("test-booking-id");
    }

    @Test
    void testCreateNotification_WithoutReminderType() {
        // Given
        Notification expectedNotification = new Notification();
        expectedNotification.setUserId(testUserId);
        expectedNotification.setTitle("Test Title");
        expectedNotification.setMessage("Test message");
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notif = invocation.getArgument(0);
            expectedNotification.setId(testNotificationId);
            return expectedNotification;
        });

        // When
        Notification result = notificationService.createNotification(
            testUserId, "Test Title", "Test message", "booking", "test-booking-id"
        );

        // Then
        assertNotNull(result);
        assertEquals(testUserId, result.getUserId());
        assertEquals("Test Title", result.getTitle());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testCreateNotification_WithReminderType() {
        // Given
        String reminderType = "upcoming-7d";
        Notification expectedNotification = new Notification();
        expectedNotification.setUserId(testUserId);
        expectedNotification.setTitle("Test Title");
        expectedNotification.setMessage("Test message");
        expectedNotification.setReminderType(reminderType);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification notif = invocation.getArgument(0);
            expectedNotification.setId(testNotificationId);
            return expectedNotification;
        });

        // When
        Notification result = notificationService.createNotification(
            testUserId, "Test Title", "Test message", "booking", "test-booking-id", reminderType
        );

        // Then
        assertNotNull(result);
        assertEquals(reminderType, result.getReminderType());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testGetUserNotifications() {
        // Given
        List<Notification> notifications = Arrays.asList(testNotification);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(testUserId)).thenReturn(notifications);

        // When
        List<Notification> result = notificationService.getUserNotifications(testUserId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testUserId, result.get(0).getUserId());
        verify(notificationRepository, times(1)).findByUserIdOrderByCreatedAtDesc(testUserId);
    }

    @Test
    void testMarkAsRead_WhenNotificationExists() {
        // Given
        testNotification.setRead(false);
        when(notificationRepository.findById(testNotificationId)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        Notification result = notificationService.markAsRead(testNotificationId);

        // Then
        assertNotNull(result);
        assertTrue(result.isRead());
        verify(notificationRepository, times(1)).findById(testNotificationId);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testMarkAsRead_WhenNotificationNotExists() {
        // Given
        when(notificationRepository.findById(testNotificationId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            notificationService.markAsRead(testNotificationId);
        });
        verify(notificationRepository, times(1)).findById(testNotificationId);
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void testMarkAllAsRead() {
        // Given
        List<Notification> notifications = Arrays.asList(testNotification);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(testUserId)).thenReturn(notifications);
        when(notificationRepository.saveAll(anyList())).thenReturn(notifications);

        // When
        notificationService.markAllAsRead(testUserId);

        // Then
        verify(notificationRepository, times(1)).findByUserIdOrderByCreatedAtDesc(testUserId);
        verify(notificationRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testDeleteNotification() {
        // When
        notificationService.deleteNotification(testNotificationId);

        // Then
        verify(notificationRepository, times(1)).deleteById(testNotificationId);
    }

    @Test
    void testGetUnreadCount() {
        // Given
        long unreadCount = 5L;
        when(notificationRepository.countByUserIdAndRead(testUserId, false)).thenReturn(unreadCount);

        // When
        long result = notificationService.getUnreadCount(testUserId);

        // Then
        assertEquals(unreadCount, result);
        verify(notificationRepository, times(1)).countByUserIdAndRead(testUserId, false);
    }
}

