package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.dto.request.ProcessPaymentRequest;
import fit.se.travelling_app_be.dto.response.ProcessPaymentResponse;
import fit.se.travelling_app_be.entity.Booking;
import fit.se.travelling_app_be.entity.Destination;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final BookingService bookingService;
    private final DestinationService destinationService;
    
    public ProcessPaymentResponse processPayment(ProcessPaymentRequest request) {
        try {
            // Validate destination exists
            Optional<Destination> destinationOpt = destinationService.findById(request.getDestinationId());
            if (destinationOpt.isEmpty()) {
                return new ProcessPaymentResponse(
                    false,
                    "Destination not found",
                    null,
                    null
                );
            }
            
            // Simulate payment processing
            // In real app, this would call payment gateway (Stripe, PayPal, etc.)
            boolean paymentSuccess = simulatePaymentProcessing(request);
            
            if (!paymentSuccess) {
                return new ProcessPaymentResponse(
                    false,
                    "Payment processing failed. Please try again or use a different payment method.",
                    null,
                    null
                );
            }
            
            // Generate transaction ID
            String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Create booking
            Booking booking = createBookingFromPayment(request, destinationOpt.get());
            Booking savedBooking = bookingService.createBooking(booking);
            
            return new ProcessPaymentResponse(
                true,
                "Payment successful",
                transactionId,
                savedBooking.getId()
            );
            
        } catch (Exception e) {
            return new ProcessPaymentResponse(
                false,
                "An error occurred during payment processing: " + e.getMessage(),
                null,
                null
            );
        }
    }
    
    private boolean simulatePaymentProcessing(ProcessPaymentRequest request) {
        // Simulate payment processing based on payment method
        String paymentMethodId = request.getPaymentMethodId();
        
        // For now, all payment methods succeed
        // In real app, this would call actual payment gateway
        switch (paymentMethodId) {
            case "1": // Credit Card
            case "2": // E-wallet
            case "3": // Bank Transfer
            case "4": // Cash on Delivery
                return true;
            default:
                return false;
        }
    }
    
    private Booking createBookingFromPayment(ProcessPaymentRequest request, Destination destination) {
        Booking booking = new Booking();
        booking.setUserId(request.getUserId());
        booking.setDestination(destination);
        booking.setNumberOfTravelers(request.getParticipants() != null ? request.getParticipants() : 1);
        booking.setTotalPrice(request.getAmount());
        
        // Parse dates
        if (request.getDepartureDate() != null && !request.getDepartureDate().isEmpty()) {
            try {
                // Parse date from "dd/MM/yyyy" format
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                LocalDateTime departureDate = LocalDateTime.parse(
                    request.getDepartureDate() + " 00:00",
                    DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                );
                booking.setTravelDate(departureDate);
            } catch (Exception e) {
                // If parsing fails, use current date + 7 days as default
                booking.setTravelDate(LocalDateTime.now().plusDays(7));
            }
        } else {
            booking.setTravelDate(LocalDateTime.now().plusDays(7));
        }
        
        // Map payment method ID to name
        String paymentMethodName = getPaymentMethodName(request.getPaymentMethodId());
        booking.setPaymentMethod(paymentMethodName);
        
        // Status will be set by BookingService.createBooking based on payment method
        // Since payment is successful, it will be CONFIRMED and PAID
        
        return booking;
    }
    
    private String getPaymentMethodName(String paymentMethodId) {
        switch (paymentMethodId) {
            case "1":
                return "Thẻ tín dụng";
            case "2":
                return "Ví điện tử";
            case "3":
                return "Chuyển khoản ngân hàng";
            case "4":
                return "Thanh toán khi nhận dịch vụ";
            default:
                return "Unknown";
        }
    }
}

