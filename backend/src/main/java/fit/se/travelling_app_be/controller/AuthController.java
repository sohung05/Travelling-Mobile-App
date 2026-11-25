package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.dto.request.LoginRequest;
import fit.se.travelling_app_be.dto.request.RegisterRequest;
import fit.se.travelling_app_be.dto.response.ApiResponse;
import fit.se.travelling_app_be.dto.response.AuthResponse;
import fit.se.travelling_app_be.entity.User;
import fit.se.travelling_app_be.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        if (userService.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Email already exists"));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(request.getPassword());
        String fullName = request.getFullName();
        user.setFullName(fullName != null && !fullName.trim().isEmpty() ? fullName.trim() : "User");
        user.setPhone(request.getPhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        user.setAvatar("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face");

        User savedUser = userService.createUser(user);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken("dummy-token"); // TODO: Implement JWT
        authResponse.setUser(savedUser);
        authResponse.setMessage("User registered successfully");

        return ResponseEntity.ok(ApiResponse.success("Registration successful", authResponse));
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOptional = userService.findByEmail(request.getEmail());
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String storedPassword = user.getPassword();
            String rawPassword = request.getPassword();
            boolean passwordMatches = false;

            try {
                passwordMatches = storedPassword != null
                    && passwordEncoder.matches(rawPassword, storedPassword);
            } catch (IllegalArgumentException ex) {
                // Stored password may be legacy/plain text; fall back to direct comparison below.
                passwordMatches = false;
            }

            // Fallback for legacy/plain-text passwords (e.g. imported sample data)
            if (!passwordMatches && storedPassword != null && storedPassword.equals(rawPassword)) {
                passwordMatches = true;
                // Migrate to hashed password for future logins
                userService.changePassword(user.getId(), rawPassword);
                user = userService.findById(user.getId()).orElse(user);
            }

            if (passwordMatches) {
                AuthResponse authResponse = new AuthResponse();
                authResponse.setToken("dummy-token"); // TODO: Implement JWT
                authResponse.setUser(user);
                authResponse.setMessage("Login successful");
                
                return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
            }
        }
        
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Invalid credentials"));
    }
    
    @GetMapping("/user/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String id) {
        Optional<User> user = userService.findById(id);
        
        if (user.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(user.get()));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/user/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/user/{id}/password")
    public ResponseEntity<ApiResponse<String>> changePassword(@PathVariable String id, @RequestBody String newPassword) {
        try {
            userService.changePassword(id, newPassword);
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
