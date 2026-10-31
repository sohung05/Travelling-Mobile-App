package fit.se.travelling_app_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentResponse {
    private boolean success;
    private String message;
    private String transactionId;
    private String bookingId;
}

