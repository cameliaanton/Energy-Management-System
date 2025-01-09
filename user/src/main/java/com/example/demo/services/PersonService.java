package com.example.demo.services;

import com.example.demo.dtos.*;
import com.example.demo.dtos.LoginDTO;
import com.example.demo.entities.Person;

import java.util.List;
import java.util.Optional;

public interface PersonService {

    LoginViewDTO login(LoginDTO loginDTO);
    PersonDTO createPerson(PersonRegisterDTO personDTO);

    // Retrieve all Persons
    List<PersonDTO> getAllPersons();

    // Retrieve a Person by ID
    Optional<PersonDTO> getPersonById(Long id);

    // Update a Person
    Optional<PersonDTO> updatePerson(Long id, PersonDTO personDTO);

    // Delete a Person
    boolean deletePerson(Long id);

    Long addDevice(Long id, PersonDevicesDTO personDevicesDTO);

    List<DeviceDTO> getDevices(Long id);

    List<Person> getUsers();

    List<Person> getAdmins();
}
