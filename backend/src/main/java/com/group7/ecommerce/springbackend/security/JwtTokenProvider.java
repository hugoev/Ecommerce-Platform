package com.group7.ecommerce.springbackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        // Ensure the secret is at least 64 bytes (512 bits) for HS512
        // If the secret string is shorter, we'll hash it to get exactly 64 bytes
        byte[] keyBytes = secret.getBytes();
        
        // If the key is already 64+ bytes, use it directly
        if (keyBytes.length >= 64) {
            // Use first 64 bytes to ensure exact size
            byte[] exactKey = new byte[64];
            System.arraycopy(keyBytes, 0, exactKey, 0, Math.min(64, keyBytes.length));
            return Keys.hmacShaKeyFor(exactKey);
        }
        
        // If key is too short, hash it to get exactly 64 bytes
        // This ensures we always have a 512-bit key for HS512
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-512");
            byte[] hashedKey = digest.digest(keyBytes);
            return Keys.hmacShaKeyFor(hashedKey);
        } catch (java.security.NoSuchAlgorithmException e) {
            // Fallback: pad the key to 64 bytes
            byte[] paddedKey = new byte[64];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            // Fill remaining bytes by repeating the original key
            for (int i = keyBytes.length; i < 64; i++) {
                paddedKey[i] = keyBytes[i % keyBytes.length];
            }
            return Keys.hmacShaKeyFor(paddedKey);
        }
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateToken(claims, userDetails.getUsername());
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
