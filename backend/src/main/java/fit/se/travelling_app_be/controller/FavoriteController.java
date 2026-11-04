package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.dto.response.ApiResponse;
import fit.se.travelling_app_be.entity.Favorite;
import fit.se.travelling_app_be.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:19006")
public class FavoriteController {
    
    private final FavoriteRepository favoriteRepository;
    
    @PostMapping
    public ResponseEntity<ApiResponse<Favorite>> addFavorite(
            @RequestParam String userId,
            @RequestParam String destinationId) {
        try {
            // Check if already favorited
            if (favoriteRepository.existsByUserIdAndDestinationId(userId, destinationId)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Destination already in favorites"));
            }
            
            Favorite favorite = new Favorite();
            favorite.setUserId(userId);
            favorite.setDestinationId(destinationId);
            
            Favorite savedFavorite = favoriteRepository.save(favorite);
            return ResponseEntity.ok(ApiResponse.success("Added to favorites", savedFavorite));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to add favorite: " + e.getMessage()));
        }
    }
    
    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> removeFavorite(
            @RequestParam String userId,
            @RequestParam String destinationId) {
        try {
            favoriteRepository.deleteByUserIdAndDestinationId(userId, destinationId);
            return ResponseEntity.ok(ApiResponse.success("Removed from favorites", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to remove favorite: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Favorite>>> getUserFavorites(@PathVariable String userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(favorites));
    }
    
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkFavorite(
            @RequestParam String userId,
            @RequestParam String destinationId) {
        boolean isFavorite = favoriteRepository.existsByUserIdAndDestinationId(userId, destinationId);
        return ResponseEntity.ok(ApiResponse.success(isFavorite));
    }
}
