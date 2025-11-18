package com.group7.ecommerce.springbackend.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter implements Filter {

    // Rate limit configuration
    private static final int MAX_REQUESTS_PER_MINUTE = 60; // 60 requests per minute per IP
    private static final int MAX_REQUESTS_PER_HOUR = 1000; // 1000 requests per hour per IP
    private static final int BLOCK_DURATION_MINUTES = 60; // Block for 60 minutes if exceeded

    // Store request counts per IP
    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
    
    // Store blocked IPs with unblock time
    private final Map<String, LocalDateTime> blockedIPs = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String clientIP = getClientIP(httpRequest);
        
        // Clean up old entries periodically
        cleanupOldEntries();
        
        // Check if IP is blocked
        LocalDateTime unblockTime = blockedIPs.get(clientIP);
        if (unblockTime != null) {
            if (LocalDateTime.now().isBefore(unblockTime)) {
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write(
                    "{\"error\":\"Rate limit exceeded. Please try again later.\",\"retryAfter\":\"" +
                    unblockTime + "\"}"
                );
                return;
            } else {
                // Unblock expired IPs
                blockedIPs.remove(clientIP);
                requestCounts.remove(clientIP);
            }
        }
        
        // Get or create request counter for this IP
        RequestCounter counter = requestCounts.computeIfAbsent(clientIP, k -> new RequestCounter());
        
        // Increment and check limits
        counter.increment();
        
        // Check per-minute limit
        if (counter.getRequestsLastMinute() > MAX_REQUESTS_PER_MINUTE) {
            blockIP(clientIP);
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                "{\"error\":\"Too many requests. Rate limit exceeded.\",\"retryAfter\":\"" +
                blockedIPs.get(clientIP) + "\"}"
            );
            return;
        }
        
        // Check per-hour limit
        if (counter.getRequestsLastHour() > MAX_REQUESTS_PER_HOUR) {
            blockIP(clientIP);
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                "{\"error\":\"Hourly rate limit exceeded. Please try again later.\",\"retryAfter\":\"" +
                blockedIPs.get(clientIP) + "\"}"
            );
            return;
        }
        
        // Add rate limit headers
        httpResponse.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
        httpResponse.setHeader("X-RateLimit-Remaining", 
            String.valueOf(Math.max(0, MAX_REQUESTS_PER_MINUTE - counter.getRequestsLastMinute())));
        
        // Continue with the filter chain
        chain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        return request.getRemoteAddr();
    }

    private void blockIP(String ip) {
        blockedIPs.put(ip, LocalDateTime.now().plusMinutes(BLOCK_DURATION_MINUTES));
        requestCounts.remove(ip); // Clear counter when blocking
    }

    private void cleanupOldEntries() {
        // Clean up blocked IPs that have expired
        blockedIPs.entrySet().removeIf(entry -> 
            LocalDateTime.now().isAfter(entry.getValue())
        );
        
        // Clean up old request counters (older than 1 hour)
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        requestCounts.entrySet().removeIf(entry -> 
            entry.getValue().getLastRequestTime().isBefore(oneHourAgo)
        );
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // No initialization needed
    }

    @Override
    public void destroy() {
        requestCounts.clear();
        blockedIPs.clear();
    }

    // Inner class to track request counts
    private static class RequestCounter {
        private final AtomicInteger requestsLastMinute = new AtomicInteger(0);
        private final AtomicInteger requestsLastHour = new AtomicInteger(0);
        private LocalDateTime lastRequestTime = LocalDateTime.now();
        private LocalDateTime windowStartMinute = LocalDateTime.now();
        private LocalDateTime windowStartHour = LocalDateTime.now();

        public void increment() {
            LocalDateTime now = LocalDateTime.now();
            lastRequestTime = now;

            // Reset minute window if needed
            if (now.isAfter(windowStartMinute.plusMinutes(1))) {
                requestsLastMinute.set(0);
                windowStartMinute = now;
            }

            // Reset hour window if needed
            if (now.isAfter(windowStartHour.plusHours(1))) {
                requestsLastHour.set(0);
                windowStartHour = now;
            }

            requestsLastMinute.incrementAndGet();
            requestsLastHour.incrementAndGet();
        }

        public int getRequestsLastMinute() {
            return requestsLastMinute.get();
        }

        public int getRequestsLastHour() {
            return requestsLastHour.get();
        }

        public LocalDateTime getLastRequestTime() {
            return lastRequestTime;
        }
    }
}

