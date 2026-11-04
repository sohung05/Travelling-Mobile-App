package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.dto.request.ReviewRequest;
import fit.se.travelling_app_be.dto.response.ApiResponse;
import fit.se.travelling_app_be.entity.Review;
import fit.se.travelling_app_be.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(@Valid @RequestBody ReviewRequest request) {
        try {
            // Check if user already reviewed this destination
            if (reviewService.hasUserReviewedDestination(request.getUserId(), request.getDestinationId())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("You have already reviewed this destination"));
            }
            
            Review review = reviewService.createReviewFromRequest(request);
            return ResponseEntity.ok(ApiResponse.success("Review created successfully", review));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create review: " + e.getMessage()));
        }
    }
    
    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByDestination(@PathVariable String destinationId) {
        List<Review> reviews = reviewService.getReviewsByDestinationId(destinationId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Review>>> getUserReviews(@PathVariable String userId) {
        List<Review> reviews = reviewService.getReviewsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
    
    @GetMapping("/user/{userId}/destination/{destinationId}")
    public ResponseEntity<ApiResponse<Review>> getUserReviewForDestination(
            @PathVariable String userId, 
            @PathVariable String destinationId) {
        Optional<Review> review = reviewService.findReviewByUserAndDestination(userId, destinationId);
        
        if (review.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(review.get()));
        }
        
        return ResponseEntity.ok(ApiResponse.success("No review found", null));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Review>> getReviewById(@PathVariable String id) {
        Optional<Review> review = reviewService.findById(id);
        
        if (review.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(review.get()));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Review>> updateReview(@PathVariable String id, @RequestBody ReviewRequest request) {
        try {
            Review reviewDetails = new Review();
            reviewDetails.setRating(request.getRating());
            reviewDetails.setComment(request.getComment());
            reviewDetails.setImages(request.getImages());
            
            Review updatedReview = reviewService.updateReview(id, reviewDetails);
            return ResponseEntity.ok(ApiResponse.success("Review updated successfully", updatedReview));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteReview(@PathVariable String id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
