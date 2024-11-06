package com.example.demo.utils;

import com.example.demo.entities.Person;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SecurityUtil {
    public static Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Optional<Person> personDetails = (Optional<Person>) authentication.getPrincipal();
            return personDetails.get().getId();
        }
        return null;
    }
}
