package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.entity.User;
import fit.se.travelling_app_be.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private String testUserId;
    private String testEmail;

    @BeforeEach
    void setUp() {
        testUserId = "test-user-id";
        testEmail = "test@example.com";
        
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail(testEmail);
        testUser.setPassword("plainPassword");
        testUser.setFullName("Test User");
        testUser.setPhone("0123456789");
        testUser.setDateOfBirth(LocalDate.of(1990, 1, 1));
        testUser.setGender("Male");
        testUser.setAddress("Test Address");
    }

    @Test
    void testCreateUser() {
        // Given
        String hashedPassword = "hashedPassword";
        when(passwordEncoder.encode(anyString())).thenReturn(hashedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.createUser(testUser);

        // Then
        assertNotNull(result);
        assertEquals(testUserId, result.getId());
        verify(passwordEncoder, times(1)).encode("plainPassword");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testFindByEmail_WhenUserExists() {
        // Given
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.findByEmail(testEmail);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testEmail, result.get().getEmail());
        verify(userRepository, atLeastOnce()).findByEmail(testEmail);
    }

    @Test
    void testFindByEmail_WhenUserNotExists() {
        // Given
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.findByEmail(testEmail);

        // Then
        assertFalse(result.isPresent());
        verify(userRepository, atLeastOnce()).findByEmail(testEmail);
    }

    @Test
    void testFindById_WhenUserExists() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.findById(testUserId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testUserId, result.get().getId());
        verify(userRepository, atLeastOnce()).findById(testUserId);
    }

    @Test
    void testFindById_WhenUserNotExists() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.findById(testUserId);

        // Then
        assertFalse(result.isPresent());
        verify(userRepository, atLeastOnce()).findById(testUserId);
    }

    @Test
    void testUpdateUser_WhenUserExists() {
        // Given
        User updatedUser = new User();
        updatedUser.setFullName("Updated Name");
        updatedUser.setPhone("0987654321");
        
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateUser(testUserId, updatedUser);

        // Then
        assertNotNull(result);
        verify(userRepository, times(1)).findById(testUserId);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_WhenUserNotExists() {
        // Given
        User updatedUser = new User();
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.updateUser(testUserId, updatedUser);
        });
        verify(userRepository, times(1)).findById(testUserId);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUpdateUser_WithPassword() {
        // Given
        String hashedPassword = "newHashedPassword";
        User updatedUser = new User();
        updatedUser.setPassword("newPassword");
        
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newPassword")).thenReturn(hashedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateUser(testUserId, updatedUser);

        // Then
        assertNotNull(result);
        verify(passwordEncoder, times(1)).encode("newPassword");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testExistsByEmail_WhenExists() {
        // Given
        when(userRepository.existsByEmail(testEmail)).thenReturn(true);

        // When
        boolean result = userService.existsByEmail(testEmail);

        // Then
        assertTrue(result);
        verify(userRepository, times(1)).existsByEmail(testEmail);
    }

    @Test
    void testExistsByEmail_WhenNotExists() {
        // Given
        when(userRepository.existsByEmail(testEmail)).thenReturn(false);

        // When
        boolean result = userService.existsByEmail(testEmail);

        // Then
        assertFalse(result);
        verify(userRepository, times(1)).existsByEmail(testEmail);
    }

    @Test
    void testGetAllUsers() {
        // Given
        List<User> users = Arrays.asList(testUser);
        when(userRepository.findAll()).thenReturn(users);

        // When
        List<User> result = userService.getAllUsers();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testDeleteUser() {
        // When
        userService.deleteUser(testUserId);

        // Then
        verify(userRepository, times(1)).deleteById(testUserId);
    }

    @Test
    void testChangePassword_WhenUserExists() {
        // Given
        String newPassword = "newPassword";
        String hashedPassword = "hashedNewPassword";
        
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(newPassword)).thenReturn(hashedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.changePassword(testUserId, newPassword);

        // Then
        assertNotNull(result);
        verify(userRepository, times(1)).findById(testUserId);
        verify(passwordEncoder, times(1)).encode(newPassword);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testChangePassword_WhenUserNotExists() {
        // Given
        String newPassword = "newPassword";
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.changePassword(testUserId, newPassword);
        });
        verify(userRepository, times(1)).findById(testUserId);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
}


