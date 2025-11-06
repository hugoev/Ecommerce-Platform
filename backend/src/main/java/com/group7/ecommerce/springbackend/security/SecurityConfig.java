package com.group7.ecommerce.springbackend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/api/auth/**", "/images/**").permitAll()
                        // Image upload requires admin authentication (must come before general /api/items/**)
                        .requestMatchers("/api/items/upload-image").hasAuthority("ROLE_ADMIN")
                        // Public item endpoints (GET requests)
                        .requestMatchers("/api/items/**").permitAll()
                        // Sales - GET is public, write operations require admin (handled by @PreAuthorize)
                        .requestMatchers("/api/sales").permitAll()
                        // Admin endpoints require admin role
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        // User endpoints require authentication
                        .requestMatchers("/api/orders/**", "/api/cart/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                        .anyRequest().authenticated())
                .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
