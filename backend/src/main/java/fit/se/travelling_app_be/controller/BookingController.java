package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.dto.request.BookingRequest;
import fit.se.travelling_app_be.dto.response.ApiResponse;
import fit.se.travelling_app_be.entity.Booking;
import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.service.BookingService;
import fit.se.travelling_app_be.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {
    
    private final BookingService bookingService;
    private final DestinationService destinationService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(@Valid @RequestBody BookingRequest request) {
        try {
            // Get destination
            Optional<Destination> destinationOpt = destinationService.findById(request.getDestinationId());
            if (destinationOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Destination not found"));
            }
            
            // Create booking
            Booking booking = new Booking();
            booking.setUserId(request.getUserId()); // Get from request
            booking.setDestination(destinationOpt.get());
            booking.setTravelDate(request.getTravelDate());
            booking.setNumberOfTravelers(request.getNumberOfTravelers());
            booking.setTotalPrice(request.getTotalPrice());
            booking.setPaymentMethod(request.getPaymentMethod());
            if (request.getSpecialRequests() != null) {
                booking.setSpecialRequests(List.of(request.getSpecialRequests()));
            }
            
            Booking savedBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(ApiResponse.success("Booking created successfully", savedBooking));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create booking: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getUserBookings(@PathVariable String userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<ApiResponse<List<Booking>>> getUpcomingBookings(@PathVariable String userId) {
        List<Booking> bookings = bookingService.getUpcomingBookings(userId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    @GetMapping("/user/{userId}/completed")
    public ResponseEntity<ApiResponse<List<Booking>>> getCompletedBookings(@PathVariable String userId) {
        List<Booking> bookings = bookingService.getCompletedBookings(userId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(@PathVariable String id) {
        Optional<Booking> booking = bookingService.findById(id);
        
        if (booking.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(booking.get()));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Booking>> updateBookingStatus(
            @PathVariable String id, 
            @RequestParam String status) {
        try {
            Booking updatedBooking = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Booking status updated", updatedBooking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<Booking>> updatePaymentStatus(
            @PathVariable String id, 
            @RequestParam String paymentStatus) {
        try {
            Booking updatedBooking = bookingService.updatePaymentStatus(id, paymentStatus);
            return ResponseEntity.ok(ApiResponse.success("Payment status updated", updatedBooking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelBooking(@PathVariable String id) {
        try {
            bookingService.cancelBooking(id);
            return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
