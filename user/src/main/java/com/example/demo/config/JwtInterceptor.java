package com.example.demo.config;

import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.HttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.io.IOException;

public class JwtInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public org.springframework.http.client.ClientHttpResponse intercept(
            HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {

        // Obține JWT-ul din SecurityContextHolder
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getCredentials() instanceof String) {
            String jwtToken = (String) authentication.getCredentials();

            // Adaugă token-ul în header-ul Authorization
            request.getHeaders().add(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken);
        }

        // Execută request-ul cu modificările făcute
        return execution.execute(request, body);
    }
}
