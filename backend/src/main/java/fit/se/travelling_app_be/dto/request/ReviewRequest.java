package fit.se.travelling_app_be.dto.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.util.List;

@Data
public class ReviewRequest {
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Destination ID is required")
    private String destinationId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;
    
    @NotBlank(message = "Comment is required")
    private String comment;
    
    private List<String> images;
}
