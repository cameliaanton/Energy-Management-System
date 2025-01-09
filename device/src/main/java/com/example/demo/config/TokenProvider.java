package com.example.demo.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenProvider {
    @Value("${jwt.secret}") // Cheia secretă comună între microservicii
    private String JWT_SECRET;

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(JWT_SECRET);
            return JWT.require(algorithm)
                    .build()
                    .verify(token)
                    .getSubject(); // Returnează ID-ul utilizatorului (subiectul)
        } catch (JWTVerificationException e) {
            throw new RuntimeException("Token invalid: " + e.getMessage());
        }
    }
}
