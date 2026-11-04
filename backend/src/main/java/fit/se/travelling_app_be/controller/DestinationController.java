package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/destinations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DestinationController {
    
    private final DestinationService destinationService;
    
    @GetMapping
    public ResponseEntity<List<Destination>> getAllDestinations() {
        List<Destination> destinations = destinationService.getAllDestinations();
        return ResponseEntity.ok(destinations);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Destination> getDestinationById(@PathVariable String id) {
        return destinationService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<Destination>> getFeaturedDestinations() {
        List<Destination> destinations = destinationService.getFeaturedDestinations();
        return ResponseEntity.ok(destinations);
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<Destination>> getPopularDestinations() {
        List<Destination> destinations = destinationService.getPopularDestinations();
        return ResponseEntity.ok(destinations);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Destination>> searchDestinations(@RequestParam String query) {
        List<Destination> destinations = destinationService.searchDestinations(query);
        return ResponseEntity.ok(destinations);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Destination>> getDestinationsByCategory(@PathVariable String category) {
        List<Destination> destinations = destinationService.getDestinationsByCategory(category);
        return ResponseEntity.ok(destinations);
    }
    
    @PostMapping
    public ResponseEntity<Destination> createDestination(@RequestBody Destination destination) {
        Destination savedDestination = destinationService.createDestination(destination);
        return ResponseEntity.ok(savedDestination);
    }
}
