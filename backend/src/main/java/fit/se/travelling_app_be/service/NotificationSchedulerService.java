package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.entity.Booking;
import fit.se.travelling_app_be.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationSchedulerService {
    
    private final BookingService bookingService;
    private final NotificationService notificationService;
    
    // Chạy mỗi giờ để kiểm tra tour sắp khởi hành
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 ms
    public void checkUpcomingTours() {
        log.info("🔔 Checking for upcoming tours...");
        
        try {
            // Lấy tất cả bookings có status CONFIRMED hoặc PENDING
            // Use BookingService to get bookings with properly populated destinations
            List<Booking> allBookings = bookingService.getAllBookings();
            
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            LocalDate threeDaysLater = today.plusDays(3);
            
            for (Booking booking : allBookings) {
                // Chỉ xử lý tour đã xác nhận và chưa hoàn thành
                if (!"CONFIRMED".equals(booking.getStatus()) && !"PENDING".equals(booking.getStatus())) {
                    continue;
                }
                
                try {
                    // Get travel date as LocalDate
                    if (booking.getTravelDate() == null) {
                        continue;
                    }
                    
                    LocalDate travelDate = booking.getTravelDate().toLocalDate();
                    
                    // Tính số ngày còn lại
                    long daysUntilTravel = ChronoUnit.DAYS.between(today, travelDate);
                    
                    // Kiểm tra xem đã gửi notification chưa
                    boolean alreadyNotified = hasRecentNotification(
                        booking.getUserId(), 
                        booking.getId(), 
                        daysUntilTravel
                    );
                    
                    if (alreadyNotified) {
                        continue;
                    }
                    
                    String destinationName = "điểm đến của bạn";
                    if (booking.getDestination() != null && booking.getDestination().getName() != null) {
                        destinationName = booking.getDestination().getName();
                    }
                    
                    // Gửi thông báo dựa trên số ngày còn lại
                    if (daysUntilTravel == 1) {
                        // Tour khởi hành vào ngày mai
                        notificationService.createNotification(
                            booking.getUserId(),
                            "Tour sắp khởi hành! 🎒",
                            "Tour đến " + destinationName + " của bạn sẽ khởi hành vào ngày mai. Hãy chuẩn bị sẵn sàng!",
                            "booking",
                            booking.getId(),
                            "upcoming-1d"
                        );
                        log.info("✅ Sent 1-day reminder for booking: {}", booking.getId());
                        
                    } else if (daysUntilTravel == 3) {
                        // Tour khởi hành sau 3 ngày
                        DateTimeFormatter displayFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                        String travelDateStr = travelDate.format(displayFormatter);
                        
                        notificationService.createNotification(
                            booking.getUserId(),
                            "Nhắc nhở: Tour sắp khởi hành 📅",
                            "Tour đến " + destinationName + " của bạn sẽ khởi hành trong 3 ngày nữa (ngày " + travelDateStr + ").",
                            "booking",
                            booking.getId(),
                            "upcoming-3d"
                        );
                        log.info("✅ Sent 3-day reminder for booking: {}", booking.getId());
                        
                    } else if (daysUntilTravel == 0) {
                        // Tour khởi hành hôm nay
                        notificationService.createNotification(
                            booking.getUserId(),
                            "Tour khởi hành hôm nay! 🚀",
                            "Chuyến đi đến " + destinationName + " của bạn khởi hành hôm nay. Chúc bạn có một chuyến đi vui vẻ!",
                            "booking",
                            booking.getId(),
                            "upcoming-0d"
                        );
                        log.info("✅ Sent same-day reminder for booking: {}", booking.getId());
                        
                    } else if (daysUntilTravel == 7) {
                        // Tour khởi hành sau 1 tuần
                        notificationService.createNotification(
                            booking.getUserId(),
                            "Tour sắp đến! 🗓️",
                            "Tour đến " + destinationName + " của bạn sẽ khởi hành trong 1 tuần nữa. Đừng quên chuẩn bị hành lý nhé!",
                            "booking",
                            booking.getId(),
                            "upcoming-7d"
                        );
                        log.info("✅ Sent 7-day reminder for booking: {}", booking.getId());
                    }
                    
                } catch (Exception e) {
                    log.error("❌ Error processing booking {}: {}", booking.getId(), e.getMessage());
                }
            }
            
            log.info("✅ Finished checking upcoming tours");
            
        } catch (Exception e) {
            log.error("❌ Error in checkUpcomingTours: {}", e.getMessage());
        }
    }
    
    // Kiểm tra xem đã gửi notification cho booking này với reminderType cụ thể chưa
    private boolean hasRecentNotification(String userId, String bookingId, long daysUntil) {
        try {
            List<fit.se.travelling_app_be.model.Notification> notifications = 
                notificationService.getUserNotifications(userId);
            
            // Xác định reminderType cần check
            String targetReminderType;
            if (daysUntil == 0) {
                targetReminderType = "upcoming-0d";
            } else if (daysUntil == 1) {
                targetReminderType = "upcoming-1d";
            } else if (daysUntil == 3) {
                targetReminderType = "upcoming-3d";
            } else if (daysUntil == 7) {
                targetReminderType = "upcoming-7d";
            } else {
                return false; // Không phải các ngày cần reminder
            }
            
            // Kiểm tra xem đã có notification với cùng bookingId và reminderType chưa
            for (fit.se.travelling_app_be.model.Notification notification : notifications) {
                if (bookingId.equals(notification.getRelatedId()) &&
                    targetReminderType.equals(notification.getReminderType())) {
                    
                    log.info("⏭️ Skip: Already sent {} notification for booking {}", targetReminderType, bookingId);
                    return true;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("❌ Error checking recent notifications: {}", e.getMessage());
            return false; // Nếu có lỗi, cho phép gửi (better to send than skip)
        }
    }
    
    // Method để test thủ công (có thể gọi qua API)
    public void checkUpcomingToursManually() {
        log.info("🔧 Manual check triggered");
        checkUpcomingTours();
    }
}

