package com.example.demo.dtos;

import lombok.Data;

@Data
public class DeviceUpdateDTO {
    private String description;
    private String address;
    private Double maxEnergyConsumption;
}
