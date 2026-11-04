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
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Email already exists"));
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFullName(request.getFullName() != null ? request.getFullName() : "User");
        user.setPhone(request.getPhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        // Set default avatar for new users
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
            // Hash the input password and compare with hashed password in database
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
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
