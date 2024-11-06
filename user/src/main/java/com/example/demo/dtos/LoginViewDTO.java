package com.example.demo.dtos;

import com.example.demo.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginViewDTO {
    Long personId;
    Role role;
    String jwt;
}
