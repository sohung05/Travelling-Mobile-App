package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.dto.request.ReviewRequest;
import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.entity.Review;
import fit.se.travelling_app_be.entity.User;
import fit.se.travelling_app_be.repository.DestinationRepository;
import fit.se.travelling_app_be.repository.ReviewRepository;
import fit.se.travelling_app_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final DestinationRepository destinationRepository;
    private final UserRepository userRepository;
    
    @CacheEvict(value = {"reviews", "destinations"}, allEntries = true)
    public Review createReviewFromRequest(ReviewRequest request) {
        // Get user info
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Review review = new Review();
        review.setUserId(request.getUserId());
        review.setDestinationId(request.getDestinationId());
        review.setUserName(user.getFullName() != null ? user.getFullName() : "User");
        review.setUserAvatar(user.getAvatar());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setImages(request.getImages());
        
        Review savedReview = reviewRepository.save(review);
        
        // Update destination rating
        updateDestinationRating(review.getDestinationId());
        
        return savedReview;
    }
    
    @CacheEvict(value = {"reviews", "destinations"}, allEntries = true)
    public Review createReview(Review review) {
        Review savedReview = reviewRepository.save(review);
        
        // Update destination rating
        updateDestinationRating(review.getDestinationId());
        
        return savedReview;
    }
    
    /**
     * Get reviews by destination ID with caching
     * Cache: 10 minutes
     */
    @Cacheable(value = "reviews", key = "'destination:' + #destinationId")
    public List<Review> getReviewsByDestinationId(String destinationId) {
        return reviewRepository.findByDestinationIdOrderByCreatedAtDesc(destinationId);
    }
    
    /**
     * Get reviews by user ID with caching
     * Cache: 10 minutes
     */
    @Cacheable(value = "reviews", key = "'user:' + #userId")
    public List<Review> getReviewsByUserId(String userId) {
        return reviewRepository.findByUserId(userId);
    }
    
    /**
     * Find review by user and destination with caching
     * Cache: 10 minutes
     * Note: Cache Review object directly (not Optional) to avoid LinkedHashMap deserialization issue
     */
    public Optional<Review> findReviewByUserAndDestination(String userId, String destinationId) {
        // Get from cache first (cache Review directly, not Optional)
        Review cached = getReviewByUserAndDestinationCached(userId, destinationId);
        if (cached != null) {
            return Optional.of(cached);
        }
        
        // If not in cache, get from repository
        return reviewRepository.findByUserIdAndDestinationId(userId, destinationId);
    }
    
    /**
     * Get review by user and destination with caching (public method to cache Review directly)
     * Cache: 10 minutes
     * This method caches Review object (not Optional) to avoid LinkedHashMap deserialization issue
     */
    @Cacheable(value = "reviews", key = "'user:' + #userId + ':destination:' + #destinationId", unless = "#result == null")
    public Review getReviewByUserAndDestinationCached(String userId, String destinationId) {
        return reviewRepository.findByUserIdAndDestinationId(userId, destinationId).orElse(null);
    }
    
    /**
     * Check if user has reviewed destination with caching
     * Cache: 10 minutes
     */
    @Cacheable(value = "reviews", key = "'hasReviewed:' + #userId + ':' + #destinationId")
    public boolean hasUserReviewedDestination(String userId, String destinationId) {
        return reviewRepository.findByUserIdAndDestinationId(userId, destinationId).isPresent();
    }
    
    /**
     * Get reviews by destination and minimum rating with caching
     * Cache: 10 minutes
     */
    @Cacheable(value = "reviews", key = "'destination:' + #destinationId + ':rating:' + #minRating")
    public List<Review> getReviewsByRating(String destinationId, Integer minRating) {
        return reviewRepository.findByDestinationIdAndRatingGreaterThanEqual(destinationId, minRating);
    }
    
    /**
     * Find review by ID with caching
     * Cache: 10 minutes
     * Note: Cache Review object directly (not Optional) to avoid LinkedHashMap deserialization issue
     */
    public Optional<Review> findById(String id) {
        // Get from cache first (cache Review directly, not Optional)
        Review cached = getReviewByIdCached(id);
        if (cached != null) {
            return Optional.of(cached);
        }
        
        // If not in cache, get from repository
        return reviewRepository.findById(id);
    }
    
    /**
     * Get review by ID with caching (public method to cache Review directly)
     * Cache: 10 minutes
     * This method caches Review object (not Optional) to avoid LinkedHashMap deserialization issue
     */
    @Cacheable(value = "reviews", key = "#id", unless = "#result == null")
    public Review getReviewByIdCached(String id) {
        return reviewRepository.findById(id).orElse(null);
    }
    
    @CacheEvict(value = {"reviews", "destinations"}, allEntries = true)
    public Review updateReview(String id, Review reviewDetails) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setRating(reviewDetails.getRating());
        review.setComment(reviewDetails.getComment());
        review.setImages(reviewDetails.getImages());
        
        Review updatedReview = reviewRepository.save(review);
        
        // Update destination rating
        updateDestinationRating(review.getDestinationId());
        
        return updatedReview;
    }
    
    @CacheEvict(value = {"reviews", "destinations"}, allEntries = true)
    public void deleteReview(String id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        String destinationId = review.getDestinationId();
        reviewRepository.deleteById(id);
        
        // Update destination rating
        updateDestinationRating(destinationId);
    }
    
    private void updateDestinationRating(String destinationId) {
        List<Review> reviews = reviewRepository.findByDestinationId(destinationId);
        
        if (!reviews.isEmpty()) {
            double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            
            Optional<Destination> destinationOpt = destinationRepository.findById(destinationId);
            if (destinationOpt.isPresent()) {
                Destination destination = destinationOpt.get();
                destination.setRating(averageRating);
                destination.setReviewCount(reviews.size());
                destinationRepository.save(destination);
            }
        }
    }
}
