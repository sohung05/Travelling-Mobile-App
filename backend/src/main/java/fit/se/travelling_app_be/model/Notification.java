package fit.se.travelling_app_be.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    private String id;
    
    private String userId;
    private String title;
    private String message;
    private String type; // booking, payment, review, system
    private boolean read;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private String relatedId; // booking ID, destination ID, etc.
    private String reminderType; // upcoming-7d, upcoming-3d, upcoming-1d, upcoming-0d, booking-success
}

