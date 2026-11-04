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
        // Only re-seed sample data if database is empty or has broken 404 images
        boolean needsRefresh = false;
        List<Destination> existing = destinationRepository.findAll();
        if (existing.isEmpty()) {
            needsRefresh = true;
        } else {
            for (Destination d : existing) {
                if (d.getImageUrl() != null && d.getImageUrl().contains("photo-1502602898536-47ad22581b52")) {
                    needsRefresh = true;
                    break;
                }
            }
        }

        if (needsRefresh) {
            destinationRepository.deleteAll();
            createSampleDestinations();
        }
    }

    private void createSampleDestinations() {
        List<Destination> destinations = Arrays.asList(
            createDestination("Paris, France", "France", "Thành phố ánh sáng với những công trình kiến trúc tuyệt đẹp và văn hóa lãng mạn", 
                Arrays.asList("Eiffel Tower", "Louvre Museum", "Notre Dame"), 
                new Location(48.8566, 2.3522, "Paris, France", "Paris", "France"),
                "Cultural", new BigDecimal("1299"), "5 days", true, true, 4.8, 2543,
                "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
                    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800"
                )),
                
            createDestination("Tokyo, Japan", "Japan", "Thành phố hiện đại kết hợp truyền thống với ẩm thực đỉnh cao", 
                Arrays.asList("Tokyo Tower", "Senso-ji Temple", "Shibuya Crossing"), 
                new Location(35.6762, 139.6503, "Tokyo, Japan", "Tokyo", "Japan"),
                "Cultural", new BigDecimal("1899"), "7 days", true, true, 4.9, 3124,
                "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
                    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"
                )),
                
            createDestination("Da Nang, Vietnam", "Vietnam", "Thành phố biển đáng sống với Cầu Vàng Bà Nà Hills và bãi biển Mỹ Khê tuyệt đẹp", 
                Arrays.asList("Cầu Vàng", "Bà Nà Hills", "Bãi biển Mỹ Khê"), 
                new Location(16.0544, 108.2022, "Da Nang, Vietnam", "Da Nang", "Vietnam"),
                "Beach", new BigDecimal("699"), "4 days", true, true, 4.8, 1420,
                "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
                    "https://images.unsplash.com/photo-1528127269322-539801943592?w=800"
                )),
                
            createDestination("Ha Long Bay, Vietnam", "Vietnam", "Kỳ quan thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi kỳ vĩ", 
                Arrays.asList("Hang Sửng Sốt", "Đảo Ti Tốp", "Vịnh Bái Tử Long"), 
                new Location(20.9101, 107.1839, "Ha Long, Vietnam", "Quang Ninh", "Vietnam"),
                "Nature", new BigDecimal("799"), "3 days", true, true, 4.9, 2890,
                "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"
                )),
                
            createDestination("Bali, Indonesia", "Indonesia", "Thiên đường nhiệt đới với những bãi biển và ruộng bậc thang ngoạn mục", 
                Arrays.asList("Ubud", "Tanah Lot", "Mount Batur"), 
                new Location(-8.3405, 115.0920, "Bali, Indonesia", "Bali", "Indonesia"),
                "Beach", new BigDecimal("899"), "6 days", true, true, 4.7, 1876,
                "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
                    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800"
                )),
                
            createDestination("Dubai, UAE", "United Arab Emirates", "Thành phố của tương lai với tòa nhà chọc trời và phong cách thượng lưu", 
                Arrays.asList("Burj Khalifa", "Palm Jumeirah", "Dubai Mall"), 
                new Location(25.2048, 55.2708, "Dubai, UAE", "Dubai", "United Arab Emirates"),
                "Luxury", new BigDecimal("1799"), "5 days", true, true, 4.8, 2987,
                "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
                    "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800"
                )),
                
            createDestination("Santorini, Greece", "Greece", "Hòn đảo xinh đẹp với kiến trúc mái vòm xanh nhìn ra biển Aegean", 
                Arrays.asList("Oia Village", "Red Beach", "Santorini Volcano"), 
                new Location(36.3932, 25.4615, "Santorini, Greece", "Santorini", "Greece"),
                "Beach", new BigDecimal("1399"), "5 days", true, true, 4.9, 2234,
                "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
                    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800"
                ))
        );

        destinationRepository.saveAll(destinations);
        System.out.println("✅ Sample destinations initialized successfully with verified images!");
    }

    private Destination createDestination(String name, String country, String description, 
                                        List<String> highlights, Location location, 
                                        String category, BigDecimal price, String duration, 
                                        boolean featured, boolean popular, double rating, int reviewCount,
                                        String primaryImage, List<String> images) {
        Destination destination = new Destination();
        destination.setName(name);
        destination.setCountry(country);
        destination.setDescription(description);
        destination.setShortDescription(description.substring(0, Math.min(100, description.length())));
        destination.setImageUrl(primaryImage);
        destination.setImages(images != null && !images.isEmpty() ? images : Arrays.asList(primaryImage));
        destination.setRating(rating);
        destination.setReviewCount(reviewCount);
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
