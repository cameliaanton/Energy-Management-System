package com.example.demo.controllers;

import com.example.demo.dtos.DeviceDTO;
import com.example.demo.dtos.DeviceUpdateDTO;
import com.example.demo.services.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/devices")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;
//
//    @PostMapping
//    public ResponseEntity<DeviceDTO> createDevice(@RequestBody DeviceDTO deviceDTO) {
//        DeviceDTO createdPerson = deviceService.createDevice(deviceDTO);
//        return ResponseEntity.ok(createdPerson);
//    }

    // Get all Persons
    @GetMapping
    public ResponseEntity<List<DeviceDTO>> getAllPersons() {
        List<DeviceDTO> persons = deviceService.getAllDevices();
        return ResponseEntity.ok(persons);
    }

    // Get a specific Person by ID
    @GetMapping("/{id}")
    public ResponseEntity<DeviceDTO> getDeviceById(@PathVariable Long id) {
        Optional<DeviceDTO> personDTO = deviceService.getDeviceById(id);
        return personDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}")
    public ResponseEntity<DeviceDTO> updateDevice(@PathVariable Long id, @RequestBody DeviceUpdateDTO deviceDTO) {
        Optional<DeviceDTO> updatedPerson = deviceService.updateDevice(id, deviceDTO);
        return updatedPerson.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        boolean deleted = deviceService.deleteDevice(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}