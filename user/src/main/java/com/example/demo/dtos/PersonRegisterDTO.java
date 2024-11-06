package com.example.demo.dtos;

import lombok.Data;

@Data
public class PersonRegisterDTO {
    private String name;
    private String email;
    private String role;
    private String personPassword;
}
