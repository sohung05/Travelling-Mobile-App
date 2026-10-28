package fit.se.travelling_app_be.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @DBRef
    private Destination destination;
    
    private String status; // PENDING, CONFIRMED, CANCELLED, COMPLETED
    private LocalDateTime bookingDate;
    private LocalDateTime travelDate;
    private Integer numberOfTravelers;
    private BigDecimal totalPrice;
    private String paymentMethod;
    private String paymentStatus; // PENDING, PAID, FAILED, REFUNDED
    
    private ContactInfo contactInfo;
    private List<String> specialRequests = new ArrayList<>();
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class ContactInfo {
    private String fullName;
    private String email;
    private String phone;
    private String address;
}
