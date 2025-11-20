package com.group7.ecommerce.springbackend.user;

import java.util.NoSuchElementException;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group7.ecommerce.springbackend.common.ApiResponse;
import com.group7.ecommerce.springbackend.security.JwtTokenProvider;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public UserController(@Lazy UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDTO>> register(
            @RequestBody @Valid UserRequestDTOs.RegisterRequest request) {
        try {
            User user = userService.register(
                    request.getUsername(),
                    request.getPassword(),
                    request.getFullName());
            UserResponseDTO userResponse = new UserResponseDTO(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(userResponse, "User registered successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @RequestBody @Valid UserRequestDTOs.LoginRequest request) {
        try {
            User user = userService.login(request.getUsername(), request.getPassword());
            UserResponseDTO userResponse = new UserResponseDTO(user);

            // Generate JWT token
            String token = jwtTokenProvider.generateToken(userService.loadUserByUsername(user.getUsername()));

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setUser(userResponse);
            loginResponse.setToken(token);

            return ResponseEntity.ok(ApiResponse.success(loginResponse, "Login successful"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid credentials"));
        }
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getProfile(@PathVariable Long id) {
        try {
            User user = userService.getById(id);
            UserResponseDTO userResponse = new UserResponseDTO(user);
            return ResponseEntity.ok(ApiResponse.success(userResponse));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateProfile(@PathVariable Long id,
            @RequestBody @Valid UserRequestDTOs.UpdateProfileRequest request) {
        try {
            User user = userService.updateProfile(
                    id,
                    request.getFullName(),
                    request.getAddress(),
                    request.getPhone());
            UserResponseDTO userResponse = new UserResponseDTO(user);
            return ResponseEntity.ok(ApiResponse.success(userResponse, "Profile updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/change-password/{id}")
    public ResponseEntity<ApiResponse<Void>> changePassword(@PathVariable Long id,
            @RequestBody @Valid UserRequestDTOs.ChangePasswordRequest request) {
        try {
            userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User not found"));
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An error occurred while changing password: " + e.getMessage()));
        }
    }

    // Inner class for login response
    public static class LoginResponse {
        private UserResponseDTO user;
        private String token;

        public UserResponseDTO getUser() {
            return user;
        }

        public void setUser(UserResponseDTO user) {
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }
    }

}
