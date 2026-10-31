package fit.se.travelling_app_be.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProcessPaymentRequest {
    @NotBlank(message = "Order ID is required")
    private String orderId;
    
    @NotBlank(message = "Payment method ID is required")
    private String paymentMethodId;
    
    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be positive")
    private BigDecimal amount;
    
    private String currency = "USD";
    
    // Booking information
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Destination ID is required")
    private String destinationId;
    
    private String departureDate;
    private String returnDate;
    
    @Min(value = 1, message = "Participants must be at least 1")
    private Integer participants;
    
    private List<String> services; // Selected service IDs
}

