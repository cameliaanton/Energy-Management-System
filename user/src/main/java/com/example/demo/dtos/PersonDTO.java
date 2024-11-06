package com.example.demo.dtos;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PersonDTO {
    private Long id;
    private String name;
    private String email;
    private String role; // Use string for easy representation in API
}