package fit.se.travelling_app_be.repository;

import fit.se.travelling_app_be.entity.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    
    List<Favorite> findByUserId(String userId);
    
    Optional<Favorite> findByUserIdAndDestinationId(String userId, String destinationId);
    
    boolean existsByUserIdAndDestinationId(String userId, String destinationId);
    
    void deleteByUserIdAndDestinationId(String userId, String destinationId);
}
