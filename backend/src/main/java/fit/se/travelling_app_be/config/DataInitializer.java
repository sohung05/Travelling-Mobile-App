package fit.se.travelling_app_be.config;

import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.entity.Location;
import fit.se.travelling_app_be.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DestinationRepository destinationRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only create sample data if database is empty
        if (destinationRepository.count() == 0) {
            createSampleDestinations();
        }
    }

    private void createSampleDestinations() {
        List<Destination> destinations = Arrays.asList(
            createDestination("Paris, France", "France", "Thành phố ánh sáng với những công trình kiến trúc tuyệt đẹp", 
                Arrays.asList("Eiffel Tower", "Louvre Museum", "Notre Dame"), 
                new Location(48.8566, 2.3522, "Paris, France", "Paris", "France"),
                "Cultural", new BigDecimal("2500000"), "5 days", true, true),
                
            createDestination("Tokyo, Japan", "Japan", "Thành phố hiện đại kết hợp truyền thống", 
                Arrays.asList("Tokyo Tower", "Senso-ji Temple", "Shibuya Crossing"), 
                new Location(35.6762, 139.6503, "Tokyo, Japan", "Tokyo", "Japan"),
                "Cultural", new BigDecimal("3200000"), "7 days", true, true),
                
            createDestination("Bali, Indonesia", "Indonesia", "Thiên đường nhiệt đới với những bãi biển tuyệt đẹp", 
                Arrays.asList("Ubud", "Tanah Lot", "Mount Batur"), 
                new Location(-8.3405, 115.0920, "Bali, Indonesia", "Bali", "Indonesia"),
                "Beach", new BigDecimal("1800000"), "6 days", true, true),
                
            createDestination("Dubai, UAE", "United Arab Emirates", "Thành phố vàng với những tòa nhà chọc trời", 
                Arrays.asList("Burj Khalifa", "Palm Jumeirah", "Dubai Mall"), 
                new Location(25.2048, 55.2708, "Dubai, UAE", "Dubai", "United Arab Emirates"),
                "Luxury", new BigDecimal("4500000"), "4 days", false, true),
                
            createDestination("Santorini, Greece", "Greece", "Hòn đảo xinh đẹp với kiến trúc trắng xanh", 
                Arrays.asList("Oia Village", "Red Beach", "Santorini Volcano"), 
                new Location(36.3932, 25.4615, "Santorini, Greece", "Santorini", "Greece"),
                "Beach", new BigDecimal("2800000"), "5 days", false, true)
        );

        destinationRepository.saveAll(destinations);
        System.out.println("Sample destinations created successfully!");
    }

    private Destination createDestination(String name, String country, String description, 
                                        List<String> highlights, Location location, 
                                        String category, BigDecimal price, String duration, 
                                        boolean featured, boolean popular) {
        Destination destination = new Destination();
        destination.setName(name);
        destination.setCountry(country);
        destination.setDescription(description);
        destination.setShortDescription(description.substring(0, Math.min(100, description.length())));
        String primaryImage = "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop";
        destination.setImageUrl(primaryImage);
        destination.setImages(Arrays.asList(
            primaryImage,
            "https://images.unsplash.com/photo-1513639765736-5c6d1f8e1b5c?w=800&h=600&fit=crop"
        ));
        destination.setRating(4.5);
        destination.setReviewCount(128);
        destination.setPrice(price);
        destination.setDuration(duration);
        destination.setCategory(category);
        destination.setFeatured(featured);
        destination.setPopular(popular);
        destination.setLocation(location);
        destination.setHighlights(highlights);
        destination.setAmenities(Arrays.asList("WiFi", "Breakfast", "Airport Transfer", "Guide"));
        
        return destination;
    }
}
