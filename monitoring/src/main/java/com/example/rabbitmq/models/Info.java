package com.example.rabbitmq.models;

import lombok.Data;

@Data
public class Info {
    private Long deviceId;
    private Double measurementValue;
    private Long timestamp;

}
