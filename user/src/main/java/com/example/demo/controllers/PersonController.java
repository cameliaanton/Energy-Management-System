package com.example.demo.controllers;

import com.example.demo.dtos.*;
import com.example.demo.dtos.LoginDTO;
import com.example.demo.services.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/person")
public class PersonController {

    @Autowired
    private PersonService personService;
    // Create a new Person
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void createPerson(@RequestBody PersonRegisterDTO personDTO) {
        PersonDTO createdPerson = personService.createPerson(personDTO);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginViewDTO> login(@RequestBody LoginDTO loginDTO){
        return new ResponseEntity<>(personService.login(loginDTO),HttpStatus.OK);
    }
    // Get all Persons
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<PersonDTO> getAllPersons() {
        return personService.getAllPersons();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonDTO> getPersonById(@PathVariable Long id) {
        Optional<PersonDTO> personDTO = personService.getPersonById(id);
        return personDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}")
    public ResponseEntity<PersonDTO> updatePerson(@PathVariable Long id, @RequestBody PersonDTO personDTO) {
        Optional<PersonDTO> updatedPerson = personService.updatePerson(id, personDTO);
        return updatedPerson.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable Long id) {
        boolean deleted = personService.deletePerson(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
    @PostMapping("/devices/{id}")
    public ResponseEntity<Long> addDevice(@PathVariable Long id,@RequestBody PersonDevicesDTO personDevicesDTO)
    {
        Long deviceId= personService.addDevice(id,personDevicesDTO);
        return ResponseEntity.ok(deviceId);
    }
    @GetMapping("/{id}/devices")
    public ResponseEntity<List<DeviceDTO>> getDevices(@PathVariable Long id){
        List<DeviceDTO> devices= personService.getDevices(id);
        return ResponseEntity.ok(devices);
    }
}