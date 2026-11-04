package fit.se.travelling_app_be.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "destinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Destination {
    @Id
    private String id;
    
    @Indexed
    private String name;
    
    @Indexed
    private String country;
    
    private String description;
    private String shortDescription;
    
    // Primary image URL for display
    private String imageUrl;
    
    // Array of image URLs
    private List<String> images = new ArrayList<>();
    
    private Double rating = 0.0;
    private Integer reviewCount = 0;
    private BigDecimal price;
    private String duration;
    
    @Indexed
    private String category;
    
    @Indexed
    private Boolean featured = false;
    
    @Indexed
    private Boolean popular = false;
    
    // Embedded location document
    private Location location;
    
    // Arrays for highlights and amenities
    private List<String> highlights = new ArrayList<>();
    private List<String> amenities = new ArrayList<>();
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
