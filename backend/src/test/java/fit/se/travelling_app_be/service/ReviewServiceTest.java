package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.dto.request.ReviewRequest;
import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.entity.Review;
import fit.se.travelling_app_be.entity.User;
import fit.se.travelling_app_be.repository.DestinationRepository;
import fit.se.travelling_app_be.repository.ReviewRepository;
import fit.se.travelling_app_be.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private Review testReview;
    private User testUser;
    private Destination testDestination;
    private String testReviewId;
    private String testUserId;
    private String testDestinationId;

    @BeforeEach
    void setUp() {
        testReviewId = "test-review-id";
        testUserId = "test-user-id";
        testDestinationId = "test-destination-id";

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setFullName("Test User");
        testUser.setAvatar("avatar-url");

        testDestination = new Destination();
        testDestination.setId(testDestinationId);
        testDestination.setName("Test Destination");
        testDestination.setRating(4.5);

        testReview = new Review();
        testReview.setId(testReviewId);
        testReview.setUserId(testUserId);
        testReview.setDestinationId(testDestinationId);
        testReview.setUserName("Test User");
        testReview.setUserAvatar("avatar-url");
        testReview.setRating(5);
        testReview.setComment("Great destination!");
    }

    @Test
    void testCreateReviewFromRequest() {
        // Given
        ReviewRequest request = new ReviewRequest();
        request.setUserId(testUserId);
        request.setDestinationId(testDestinationId);
        request.setRating(5);
        request.setComment("Great destination!");

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(reviewRepository.findByDestinationId(testDestinationId)).thenReturn(Arrays.asList(testReview));

        // When
        Review result = reviewService.createReviewFromRequest(request);

        // Then
        assertNotNull(result);
        assertEquals(testReviewId, result.getId());
        verify(userRepository, times(1)).findById(testUserId);
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void testCreateReviewFromRequest_WhenUserNotExists() {
        // Given
        ReviewRequest request = new ReviewRequest();
        request.setUserId(testUserId);
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            reviewService.createReviewFromRequest(request);
        });
        verify(userRepository, times(1)).findById(testUserId);
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    void testCreateReview() {
        // Given
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(reviewRepository.findByDestinationId(testDestinationId)).thenReturn(Arrays.asList(testReview));

        // When
        Review result = reviewService.createReview(testReview);

        // Then
        assertNotNull(result);
        assertEquals(testReviewId, result.getId());
        verify(reviewRepository, times(1)).save(testReview);
    }

    @Test
    void testGetReviewsByDestinationId() {
        // Given
        List<Review> reviews = Arrays.asList(testReview);
        when(reviewRepository.findByDestinationIdOrderByCreatedAtDesc(testDestinationId)).thenReturn(reviews);

        // When
        List<Review> result = reviewService.getReviewsByDestinationId(testDestinationId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(reviewRepository, times(1)).findByDestinationIdOrderByCreatedAtDesc(testDestinationId);
    }

    @Test
    void testGetReviewsByUserId() {
        // Given
        List<Review> reviews = Arrays.asList(testReview);
        when(reviewRepository.findByUserId(testUserId)).thenReturn(reviews);

        // When
        List<Review> result = reviewService.getReviewsByUserId(testUserId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(reviewRepository, times(1)).findByUserId(testUserId);
    }

    @Test
    void testFindReviewByUserAndDestination_WhenExists() {
        // Given
        when(reviewRepository.findByUserIdAndDestinationId(testUserId, testDestinationId))
            .thenReturn(Optional.of(testReview));

        // When
        Optional<Review> result = reviewService.findReviewByUserAndDestination(testUserId, testDestinationId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testReviewId, result.get().getId());
        verify(reviewRepository, atLeastOnce()).findByUserIdAndDestinationId(testUserId, testDestinationId);
    }

    @Test
    void testFindReviewByUserAndDestination_WhenNotExists() {
        // Given
        when(reviewRepository.findByUserIdAndDestinationId(testUserId, testDestinationId))
            .thenReturn(Optional.empty());

        // When
        Optional<Review> result = reviewService.findReviewByUserAndDestination(testUserId, testDestinationId);

        // Then
        assertFalse(result.isPresent());
        verify(reviewRepository, atLeastOnce()).findByUserIdAndDestinationId(testUserId, testDestinationId);
    }

    @Test
    void testHasUserReviewedDestination_WhenReviewed() {
        // Given
        when(reviewRepository.findByUserIdAndDestinationId(testUserId, testDestinationId))
            .thenReturn(Optional.of(testReview));

        // When
        boolean result = reviewService.hasUserReviewedDestination(testUserId, testDestinationId);

        // Then
        assertTrue(result);
        verify(reviewRepository, times(1)).findByUserIdAndDestinationId(testUserId, testDestinationId);
    }

    @Test
    void testHasUserReviewedDestination_WhenNotReviewed() {
        // Given
        when(reviewRepository.findByUserIdAndDestinationId(testUserId, testDestinationId))
            .thenReturn(Optional.empty());

        // When
        boolean result = reviewService.hasUserReviewedDestination(testUserId, testDestinationId);

        // Then
        assertFalse(result);
        verify(reviewRepository, times(1)).findByUserIdAndDestinationId(testUserId, testDestinationId);
    }

    @Test
    void testGetReviewsByRating() {
        // Given
        Integer minRating = 4;
        List<Review> reviews = Arrays.asList(testReview);
        when(reviewRepository.findByDestinationIdAndRatingGreaterThanEqual(testDestinationId, minRating))
            .thenReturn(reviews);

        // When
        List<Review> result = reviewService.getReviewsByRating(testDestinationId, minRating);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getRating() >= minRating);
        verify(reviewRepository, times(1))
            .findByDestinationIdAndRatingGreaterThanEqual(testDestinationId, minRating);
    }

    @Test
    void testFindById_WhenExists() {
        // Given
        when(reviewRepository.findById(testReviewId)).thenReturn(Optional.of(testReview));

        // When
        Optional<Review> result = reviewService.findById(testReviewId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testReviewId, result.get().getId());
        verify(reviewRepository, atLeastOnce()).findById(testReviewId);
    }

    @Test
    void testFindById_WhenNotExists() {
        // Given
        when(reviewRepository.findById(testReviewId)).thenReturn(Optional.empty());

        // When
        Optional<Review> result = reviewService.findById(testReviewId);

        // Then
        assertFalse(result.isPresent());
        verify(reviewRepository, atLeastOnce()).findById(testReviewId);
    }

    @Test
    void testUpdateReview_WhenExists() {
        // Given
        Review updatedReview = new Review();
        updatedReview.setRating(4);
        updatedReview.setComment("Updated comment");

        when(reviewRepository.findById(testReviewId)).thenReturn(Optional.of(testReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(reviewRepository.findByDestinationId(testDestinationId)).thenReturn(Arrays.asList(testReview));

        // When
        Review result = reviewService.updateReview(testReviewId, updatedReview);

        // Then
        assertNotNull(result);
        verify(reviewRepository, times(1)).findById(testReviewId);
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void testUpdateReview_WhenNotExists() {
        // Given
        Review updatedReview = new Review();
        when(reviewRepository.findById(testReviewId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            reviewService.updateReview(testReviewId, updatedReview);
        });
        verify(reviewRepository, times(1)).findById(testReviewId);
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    void testDeleteReview_WhenExists() {
        // Given
        when(reviewRepository.findById(testReviewId)).thenReturn(Optional.of(testReview));
        when(reviewRepository.findByDestinationId(testDestinationId)).thenReturn(Arrays.asList());
        // Note: updateDestinationRating is called but when reviews list is empty, 
        // it doesn't call destinationRepository.findById

        // When
        reviewService.deleteReview(testReviewId);

        // Then
        verify(reviewRepository, times(1)).findById(testReviewId);
        verify(reviewRepository, times(1)).deleteById(testReviewId);
        verify(reviewRepository, times(1)).findByDestinationId(testDestinationId);
    }

    @Test
    void testDeleteReview_WhenNotExists() {
        // Given
        when(reviewRepository.findById(testReviewId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            reviewService.deleteReview(testReviewId);
        });
        verify(reviewRepository, times(1)).findById(testReviewId);
        verify(reviewRepository, never()).deleteById(anyString());
    }
}


