package fit.se.travelling_app_be.repository;

import fit.se.travelling_app_be.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    
    List<Review> findByDestinationId(String destinationId);
    
    List<Review> findByUserId(String userId);
    
    Optional<Review> findByUserIdAndDestinationId(String userId, String destinationId);
    
    @Query("{'destinationId': ?0, 'rating': {$gte: ?1}}")
    List<Review> findByDestinationIdAndRatingGreaterThanEqual(String destinationId, Integer minRating);
    
    List<Review> findByDestinationIdOrderByCreatedAtDesc(String destinationId);
}
