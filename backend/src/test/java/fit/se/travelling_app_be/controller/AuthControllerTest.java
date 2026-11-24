package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.dto.request.LoginRequest;
import fit.se.travelling_app_be.dto.response.ApiResponse;
import fit.se.travelling_app_be.dto.response.AuthResponse;
import fit.se.travelling_app_be.entity.User;
import fit.se.travelling_app_be.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId("USR001");
        sampleUser.setEmail("nguyenvanan@gmail.com");
        sampleUser.setPassword("nguyenvanan123");
        sampleUser.setFullName("Nguyễn Văn An");
        sampleUser.setPhone("0901234567");
    }

    @Test
    void testLoginWithPlainTextPasswordFallback() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nguyenvanan@gmail.com");
        request.setPassword("nguyenvanan123");

        when(userService.findByEmail("nguyenvanan@gmail.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("nguyenvanan123", "nguyenvanan123")).thenReturn(false);

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Login successful", response.getBody().getMessage());
        assertEquals("USR001", response.getBody().getData().getUser().getId());
        assertEquals("Nguyễn Văn An", response.getBody().getData().getUser().getFullName());
    }
}
