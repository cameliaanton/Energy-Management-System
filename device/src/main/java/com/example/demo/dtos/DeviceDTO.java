package com.example.demo.dtos;


import lombok.Data;

@Data
public class DeviceDTO {
    private Long id;
    private String description;
    private String address;
    private Double maxEnergyConsumption;
}