package com.example.demo.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.demo.entities.Person;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenProvider {
    @Value("${jwt.secret}")
    private String JWT_SECRET;

    public String generateAccessToken(Person person){
        Algorithm algorithm=Algorithm.HMAC256(JWT_SECRET);
        return JWT.create()
                .withSubject(person.getId().toString())
                .withExpiresAt(genAccessExpirationDate())
                .sign(algorithm);
    }
    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(JWT_SECRET);
            return JWT.require(algorithm)
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            System.out.println("JWT verification failed: " + exception.getMessage());
            throw new JWTVerificationException("Error while validating token", exception);
        }
    }
    private Instant genAccessExpirationDate() {
        return LocalDateTime.now().plusHours(3).toInstant(ZoneOffset.of("-03:00"));
    }
}
