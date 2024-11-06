package com.example.demo.config;

import com.example.demo.entities.Person;
import com.example.demo.handle.PersonNotFoundException;
import com.example.demo.repositories.PersonRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {
    private final TokenProvider tokenProvider;
    private final PersonRepository personRepository;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);

        if (token != null) {
            Long personId = Long.parseLong(tokenProvider.validateToken(token));
            System.out.println("Valid token: "+token);
            Optional<Person> person = personRepository.findById(personId);
            if (person.isPresent()) {
                var personDetails = person.get(); // This should be UserDetails (Person implements it)
                var authentication = new UsernamePasswordAuthenticationToken(personDetails, null, personDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                System.out.println("uite ce rau sunt ");
                throw new PersonNotFoundException("Person not found based on jwt");
            }

        }

        filterChain.doFilter(request, response);
    }
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");

        if (authHeader == null)
            return null;

        return authHeader.replace("Bearer ", "");
    }
}
