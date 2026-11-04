package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DestinationService {
    
    private final DestinationRepository destinationRepository;
    
    /**
     * Get all destinations with caching
     * Cache: 1 hour
     */
    @Cacheable(value = "destinations", key = "'all'")
    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }
    
    /**
     * Get destination by ID with caching
     * Cache: 1 hour
     * Note: Cache Destination object directly (not Optional) to avoid LinkedHashMap deserialization issue
     */
    public Optional<Destination> findById(String id) {
        // Get from cache first (cache Destination directly, not Optional)
        Destination cached = getDestinationByIdCached(id);
        if (cached != null) {
            return Optional.of(cached);
        }
        
        // If not in cache, get from repository
        Optional<Destination> destinationOpt = destinationRepository.findById(id);
        return destinationOpt;
    }
    
    /**
     * Get destination by ID with caching (public method to cache Destination directly)
     * Cache: 1 hour
     * This method caches Destination object (not Optional) to avoid LinkedHashMap deserialization issue
     */
    @Cacheable(value = "destinations", key = "#id", unless = "#result == null")
    public Destination getDestinationByIdCached(String id) {
        return destinationRepository.findById(id).orElse(null);
    }
    
    /**
     * Get featured destinations with caching
     * Cache: 1 hour
     */
    @Cacheable(value = "destinations", key = "'featured'")
    public List<Destination> getFeaturedDestinations() {
        return destinationRepository.findByFeaturedTrue();
    }
    
    /**
     * Get popular destinations with caching
     * Cache: 1 hour
     */
    @Cacheable(value = "destinations", key = "'popular'")
    public List<Destination> getPopularDestinations() {
        return destinationRepository.findByPopularTrue();
    }
    
    /**
     * Search destinations with caching
     * Cache: 5 minutes (search results change more frequently)
     */
    @Cacheable(value = "search", key = "#query")
    public List<Destination> searchDestinations(String query) {
        return destinationRepository.findByNameContainingIgnoreCase(query);
    }
    
    /**
     * Get destinations by category with caching
     * Cache: 1 hour
     */
    @Cacheable(value = "destinations", key = "'category:' + #category")
    public List<Destination> getDestinationsByCategory(String category) {
        return destinationRepository.findByCategory(category);
    }
    
    public List<Destination> getDestinationsByCountry(String country) {
        return destinationRepository.findByCountry(country);
    }
    
    public List<Destination> getDestinationsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return destinationRepository.findByPriceBetween(minPrice, maxPrice);
    }
    
    public List<Destination> getDestinationsByRating(Double minRating) {
        return destinationRepository.findByRatingGreaterThanEqual(minRating);
    }
    
    public List<Destination> getDestinationsWithFilters(String category, BigDecimal minPrice, 
                                                       BigDecimal maxPrice, Double minRating) {
        if (category != null && minPrice != null && maxPrice != null && minRating != null) {
            return destinationRepository.findByCategoryAndPriceRangeAndRating(category, minPrice, maxPrice, minRating);
        }
        
        // Fallback to simple queries if not all filters are provided
        return destinationRepository.findAll();
    }
    
    /**
     * Create destination and invalidate cache
     */
    @CacheEvict(value = {"destinations", "search"}, allEntries = true)
    public Destination createDestination(Destination destination) {
        return destinationRepository.save(destination);
    }
    
    /**
     * Update destination and invalidate cache
     */
    @CacheEvict(value = {"destinations", "search"}, allEntries = true)
    public Destination updateDestination(String id, Destination destinationDetails) {
        Destination destination = destinationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Destination not found"));
        
        destination.setName(destinationDetails.getName());
        destination.setCountry(destinationDetails.getCountry());
        destination.setDescription(destinationDetails.getDescription());
        destination.setShortDescription(destinationDetails.getShortDescription());
        destination.setImages(destinationDetails.getImages());
        destination.setPrice(destinationDetails.getPrice());
        destination.setDuration(destinationDetails.getDuration());
        destination.setCategory(destinationDetails.getCategory());
        destination.setFeatured(destinationDetails.getFeatured());
        destination.setPopular(destinationDetails.getPopular());
        destination.setLocation(destinationDetails.getLocation());
        destination.setHighlights(destinationDetails.getHighlights());
        destination.setAmenities(destinationDetails.getAmenities());
        
        return destinationRepository.save(destination);
    }
    
    /**
     * Delete destination and invalidate cache
     */
    @CacheEvict(value = {"destinations", "search"}, allEntries = true)
    public void deleteDestination(String id) {
        destinationRepository.deleteById(id);
    }
}
