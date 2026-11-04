package fit.se.travelling_app_be.repository;

import fit.se.travelling_app_be.entity.Destination;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DestinationRepository extends MongoRepository<Destination, String> {
    
    // Find by category
    List<Destination> findByCategory(String category);
    
    // Find featured destinations
    List<Destination> findByFeaturedTrue();
    
    // Find popular destinations
    List<Destination> findByPopularTrue();
    
    // Search by name (case insensitive)
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<Destination> findByNameContainingIgnoreCase(String name);
    
    // Find by country
    List<Destination> findByCountry(String country);
    
    // Find by price range
    List<Destination> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Find by rating
    List<Destination> findByRatingGreaterThanEqual(Double rating);
    
    // Complex query with multiple criteria
    @Query("{'category': ?0, 'price': {$gte: ?1, $lte: ?2}, 'rating': {$gte: ?3}}")
    List<Destination> findByCategoryAndPriceRangeAndRating(
        String category, BigDecimal minPrice, BigDecimal maxPrice, Double minRating);
}
