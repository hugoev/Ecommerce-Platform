package com.group7.ecommerce.springbackend.user;

import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(String username, String password, String fullName) {
        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Create new user
        User user = new User(username, passwordEncoder.encode(password), fullName);
        return userRepository.save(user);
    }

    public User login(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!user.getIsActive()) {
            throw new IllegalArgumentException("Account is deactivated");
        }

        return user;
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    @Transactional
    public User updateProfile(Long userId, String fullName, String address, String phone) {
        User user = getById(userId);

        if (fullName != null)
            user.setFullName(fullName);
        if (address != null)
            user.setAddress(address);
        if (phone != null)
            user.setPhone(phone);

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Encode and set the new password
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        
        // Save and flush to ensure it's committed to the database
        userRepository.save(user);
        userRepository.flush();
        
        // Verify the password was saved correctly by attempting to match it
        User savedUser = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User not found after password change"));
        
        if (!passwordEncoder.matches(newPassword, savedUser.getPassword())) {
            throw new IllegalStateException("Password was not saved correctly. Please try again.");
        }
    }

    public boolean isAdmin(Long userId) {
        User user = getById(userId);
        return user.getRole() == User.Role.ROLE_ADMIN;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("UserService - Loading user by username: " + username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    System.out.println("UserService - User not found in database: " + username);
                    return new UsernameNotFoundException("User not found: " + username);
                });

        System.out.println("UserService - Found user: " + user.getUsername() + " with role: " + user.getRole());
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build();
    }
}
