package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.entity.User;
import fit.se.travelling_app_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @CacheEvict(value = "users", allEntries = true)
    public User createUser(User user) {
        // Hash password before saving to database
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    /**
     * Get user by email with caching
     * Cache: 15 minutes
     * Note: Cache User object directly (not Optional) to avoid LinkedHashMap deserialization issue
     */
    public Optional<User> findByEmail(String email) {
        // Get from cache first (cache User directly, not Optional)
        User cached = getUserByEmailCached(email);
        if (cached != null) {
            return Optional.of(cached);
        }
        
        // If not in cache, get from repository
        return userRepository.findByEmail(email);
    }
    
    /**
     * Get user by email with caching (public method to cache User directly)
     * Cache: 15 minutes
     * This method caches User object (not Optional) to avoid LinkedHashMap deserialization issue
     */
    @Cacheable(value = "users", key = "'email:' + #email", unless = "#result == null")
    public User getUserByEmailCached(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    /**
     * Get user by ID with caching
     * Cache: 15 minutes
     * Note: Cache User object directly (not Optional) to avoid LinkedHashMap deserialization issue
     */
    public Optional<User> findById(String id) {
        // Get from cache first (cache User directly, not Optional)
        User cached = getUserByIdCached(id);
        if (cached != null) {
            return Optional.of(cached);
        }
        
        // If not in cache, get from repository
        Optional<User> userOpt = userRepository.findById(id);
        return userOpt;
    }
    
    /**
     * Get user by ID with caching (public method to cache User directly)
     * Cache: 15 minutes
     * This method caches User object (not Optional) to avoid LinkedHashMap deserialization issue
     */
    @Cacheable(value = "users", key = "#id", unless = "#result == null")
    public User getUserByIdCached(String id) {
        return userRepository.findById(id).orElse(null);
    }
    
    @CacheEvict(value = "users", key = "#id")
    public User updateUser(String id, User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only update fields that are not null
        if (userDetails.getFullName() != null) {
            user.setFullName(userDetails.getFullName());
        }
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        if (userDetails.getDateOfBirth() != null) {
            user.setDateOfBirth(userDetails.getDateOfBirth());
        }
        if (userDetails.getGender() != null) {
            user.setGender(userDetails.getGender());
        }
        if (userDetails.getAddress() != null) {
            user.setAddress(userDetails.getAddress());
        }
        if (userDetails.getAvatar() != null) {
            user.setAvatar(userDetails.getAvatar());
        }
        if (userDetails.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        return userRepository.save(user);
    }
    
    @Cacheable(value = "users", key = "'exists:' + #email")
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Cacheable(value = "users", key = "'all'")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @CacheEvict(value = "users", allEntries = true)
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
    @CacheEvict(value = "users", key = "#id")
    public User changePassword(String id, String newPassword) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}
