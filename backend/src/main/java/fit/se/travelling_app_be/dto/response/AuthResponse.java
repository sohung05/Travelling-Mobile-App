package fit.se.travelling_app_be.dto.response;

import fit.se.travelling_app_be.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private User user;
    private String message;
}
