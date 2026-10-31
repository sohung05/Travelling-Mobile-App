package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.dto.request.ProcessPaymentRequest;
import fit.se.travelling_app_be.dto.response.ProcessPaymentResponse;
import fit.se.travelling_app_be.entity.Booking;
import fit.se.travelling_app_be.entity.Destination;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private DestinationService destinationService;

    @InjectMocks
    private PaymentService paymentService;

    private ProcessPaymentRequest paymentRequest;
    private Destination testDestination;
    private Booking testBooking;
    private String testUserId;
    private String testDestinationId;

    @BeforeEach
    void setUp() {
        testUserId = "test-user-id";
        testDestinationId = "test-destination-id";

        testDestination = new Destination();
        testDestination.setId(testDestinationId);
        testDestination.setName("Test Destination");
        testDestination.setPrice(new BigDecimal("1000000"));

        testBooking = new Booking();
        testBooking.setId("test-booking-id");
        testBooking.setUserId(testUserId);
        testBooking.setDestination(testDestination);

        paymentRequest = new ProcessPaymentRequest();
        paymentRequest.setOrderId("order-123");
        paymentRequest.setPaymentMethodId("1"); // Credit Card
        paymentRequest.setAmount(new BigDecimal("2000000"));
        paymentRequest.setUserId(testUserId);
        paymentRequest.setDestinationId(testDestinationId);
        paymentRequest.setDepartureDate("25/12/2024");
        paymentRequest.setParticipants(2);
    }

    @Test
    void testProcessPayment_Success() {
        // Given
        when(destinationService.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(bookingService.createBooking(any(Booking.class))).thenReturn(testBooking);

        // When
        ProcessPaymentResponse result = paymentService.processPayment(paymentRequest);

        // Then
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getTransactionId());
        assertNotNull(result.getBookingId());
        verify(destinationService, times(1)).findById(testDestinationId);
        verify(bookingService, times(1)).createBooking(any(Booking.class));
    }

    @Test
    void testProcessPayment_DestinationNotFound() {
        // Given
        when(destinationService.findById(testDestinationId)).thenReturn(Optional.empty());

        // When
        ProcessPaymentResponse result = paymentService.processPayment(paymentRequest);

        // Then
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertEquals("Destination not found", result.getMessage());
        verify(destinationService, times(1)).findById(testDestinationId);
        verify(bookingService, never()).createBooking(any(Booking.class));
    }

    @Test
    void testProcessPayment_InvalidPaymentMethod() {
        // Given
        paymentRequest.setPaymentMethodId("99"); // Invalid payment method
        when(destinationService.findById(testDestinationId)).thenReturn(Optional.of(testDestination));

        // When
        ProcessPaymentResponse result = paymentService.processPayment(paymentRequest);

        // Then
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Payment processing failed"));
        verify(destinationService, times(1)).findById(testDestinationId);
        verify(bookingService, never()).createBooking(any(Booking.class));
    }

    @Test
    void testProcessPayment_WithValidPaymentMethods() {
        // Test all valid payment methods
        String[] validPaymentMethods = {"1", "2", "3", "4"}; // Credit Card, E-wallet, Bank Transfer, Cash on Delivery

        for (String paymentMethodId : validPaymentMethods) {
            // Given
            paymentRequest.setPaymentMethodId(paymentMethodId);
            when(destinationService.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
            when(bookingService.createBooking(any(Booking.class))).thenReturn(testBooking);

            // When
            ProcessPaymentResponse result = paymentService.processPayment(paymentRequest);

            // Then
            assertNotNull(result);
            assertTrue(result.isSuccess(), "Payment method " + paymentMethodId + " should succeed");
        }
    }

    @Test
    void testProcessPayment_WithInvalidDate() {
        // Given
        paymentRequest.setDepartureDate("invalid-date");
        when(destinationService.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(bookingService.createBooking(any(Booking.class))).thenReturn(testBooking);

        // When
        ProcessPaymentResponse result = paymentService.processPayment(paymentRequest);

        // Then
        // Should still succeed but use default date (current + 7 days)
        assertNotNull(result);
        assertTrue(result.isSuccess());
        verify(bookingService, times(1)).createBooking(any(Booking.class));
    }

    @Test
    void testProcessPayment_WithNullDate() {
        // Given
        paymentRequest.setDepartureDate(null);
        when(destinationService.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(bookingService.createBooking(any(Booking.class))).thenReturn(testBooking);

        // When
        ProcessPaymentResponse result = paymentService.processPayment(paymentRequest);

        // Then
        assertNotNull(result);
        assertTrue(result.isSuccess());
        verify(bookingService, times(1)).createBooking(any(Booking.class));
    }

    @Test
    void testProcessPayment_ExceptionHandling() {
        // Given
        when(destinationService.findById(testDestinationId)).thenThrow(new RuntimeException("Database error"));

        // When
        ProcessPaymentResponse result = paymentService.processPayment(paymentRequest);

        // Then
        assertNotNull(result);
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("error occurred"));
    }
}


