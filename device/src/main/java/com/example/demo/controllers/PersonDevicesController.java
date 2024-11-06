package com.example.demo.controllers;

import com.example.demo.dtos.DeviceDTO;
import com.example.demo.entities.PersonDevices;
import com.example.demo.services.PersonDevicesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/devices")
public class PersonDevicesController {

    @Autowired
    private PersonDevicesService personDevicesService;

    @PostMapping("/assign/{personId}")
    public ResponseEntity<Long> addDevice(@PathVariable Long personId, @RequestBody DeviceDTO deviceDTO) {
        PersonDevices personDevices= personDevicesService.addDevice(personId,deviceDTO);
        return ResponseEntity.ok(personDevices.getDevice().getId());
    }
    @GetMapping("/person/{id}")
    public  ResponseEntity<List<DeviceDTO>> getDevicesByPersonId(@PathVariable Long id){
        List<DeviceDTO> personDevices= personDevicesService.getDevicesByPerson(id);
        return ResponseEntity.ok(personDevices);
    }
    @DeleteMapping(value = "/person/{id}", produces = "application/json")
    public void deletePersonAndAssociatedDevices(@PathVariable Long id){
        System.out.println("am intrat aici");
            personDevicesService.deletePersonAndDevices(id);
    }
}
