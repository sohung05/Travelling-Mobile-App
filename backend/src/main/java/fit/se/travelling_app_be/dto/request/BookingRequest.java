package fit.se.travelling_app_be.dto.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Destination ID is required")
    private String destinationId;
    
    @NotNull(message = "Travel date is required")
    private LocalDateTime travelDate;
    
    @Min(value = 1, message = "Number of travelers must be at least 1")
    private Integer numberOfTravelers;
    
    @NotNull(message = "Total price is required")
    private BigDecimal totalPrice;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    private String specialRequests;
}
