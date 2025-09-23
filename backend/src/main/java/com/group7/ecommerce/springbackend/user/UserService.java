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
    public User register(String username, String email, String password, String fullName) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create new user
        User user = new User(username, email, passwordEncoder.encode(password), fullName);
        return userRepository.save(user);
    }

    public User login(String emailOrUsername, String password) {
        Optional<User> userOptional = userRepository.findByEmailOrUsername(emailOrUsername, emailOrUsername);

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

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    @Transactional
    public User updateProfile(Long userId, String fullName, String email, String address, String phone) {
        User user = getById(userId);

        if (email != null && !email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (fullName != null)
            user.setFullName(fullName);
        if (email != null)
            user.setEmail(email);
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

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public boolean isAdmin(Long userId) {
        User user = getById(userId);
        return user.getRole() == User.Role.ROLE_ADMIN;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build();
    }
}
