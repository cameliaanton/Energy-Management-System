package com.example.rabbitmq.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hourly-consumption")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HourlyConsumption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long deviceId;
    private LocalDateTime date;
    private double consumption;
}
