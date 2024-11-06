package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "person_devices")
@AllArgsConstructor
@NoArgsConstructor
public class PersonDevices {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name="device_id",nullable = false)
    private Device device;

    @Column(name="person_id",nullable = false)
    private Long personId;
}
