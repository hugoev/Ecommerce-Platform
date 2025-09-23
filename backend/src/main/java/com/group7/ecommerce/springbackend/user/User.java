package com.group7.ecommerce.springbackend.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String password;

    private String email;

    private String firstName;

    private String lastName;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDateTime createdAt;

    private Boolean isActive;

    private String address;

    private String phone;

    public User(String username, String email, String password, String fullName) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstName = fullName;
        this.role = Role.ROLE_USER;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public void setFullName(String fullName) {
        String[] parts = fullName.split(" ", 2);
        this.firstName = parts[0];
        this.lastName = parts.length > 1 ? parts[1] : "";
    }

    public enum Role {
        ROLE_USER,
        ROLE_ADMIN
    }
}