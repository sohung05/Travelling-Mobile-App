package fit.se.travelling_app_be.repository;

import fit.se.travelling_app_be.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    List<Booking> findByUserId(String userId);
    
    List<Booking> findByUserIdAndStatus(String userId, String status);
    
    List<Booking> findByStatus(String status);
    
    @Query("{'userId': ?0, 'status': {$in: ['CONFIRMED', 'COMPLETED']}}")
    List<Booking> findActiveBookingsByUserId(String userId);
    
    @Query("{'travelDate': {$gte: ?0}, 'status': 'CONFIRMED'}")
    List<Booking> findUpcomingBookings(LocalDateTime now);
}
