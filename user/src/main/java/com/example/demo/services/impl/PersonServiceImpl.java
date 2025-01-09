package com.example.demo.services.impl;


import com.example.demo.config.TokenProvider;
import com.example.demo.dtos.*;
import com.example.demo.dtos.LoginDTO;
import com.example.demo.dtos.mapper.PersonMapper;
import com.example.demo.entities.Person;
import com.example.demo.entities.Role;
import com.example.demo.handle.PersonNotFoundException;
import com.example.demo.repositories.PersonRepository;
import com.example.demo.services.PersonService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class PersonServiceImpl implements PersonService {
    @Autowired
    private PersonRepository personRepository;
    @Autowired
    private PersonMapper personMapper;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final TokenProvider tokenProvider;

    private final RestTemplate restTemplate;

    //private final String deviceBackend="http://localhost:8082/devices/";
    //private final String deviceBackend="http://host.docker.internal:8082/devices/";
    // http://device-service.localhost/devices
    private final String deviceBackend="http://device-service:8080/devices/";
    //private final String deviceBackend="https://device-service.localhost/devices/";
    // Create a new Person
    @Override
    public PersonDTO createPerson(PersonRegisterDTO personDTO) {
        if(personRepository.findByEmail(personDTO.getEmail())!=null)
            throw new PersonNotFoundException("email already exists!");
        Person person = personMapper.toPerson(personDTO);
        person.setPersonPassword(new BCryptPasswordEncoder().encode(person.getPassword()));

        Person savedPerson = personRepository.save(person);
        return personMapper.toPersonDTO(savedPerson);
    }
    @Override
    public LoginViewDTO login(LoginDTO loginDTO) {
//        System.out.println("find email");
        Person person = personRepository.findByEmail(loginDTO.getEmail());
//        System.out.println("dupa find email");
        if (person == null) {
            throw new RuntimeException("Email not found");
        }
//        System.out.println("la parola");
        if (passwordEncoder.matches(loginDTO.getPersonPassword(), person.getPassword())) {
            // Authentication successful, generate JWT
//            System.out.println("generate jwt");
            String token = tokenProvider.generateAccessToken(person);
//            System.out.println("security");
           // var authentication = new UsernamePasswordAuthenticationToken(person, null, person.getAuthorities());
            var authentication = new UsernamePasswordAuthenticationToken(person, token, person.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

//            System.out.println("return");
            return new LoginViewDTO(person.getId(), person.getRole(), token);
        } else {
            // Invalid password
            throw new RuntimeException("Invalid email or password");
        }
    }

    // Retrieve all Persons
    @Override
    public List<PersonDTO> getAllPersons() {
        return personRepository.findAll()
                .stream()
                .map(personMapper::toPersonDTO)
                .collect(Collectors.toList());
    }

    // Retrieve a Person by ID
    @Override
    public Optional<PersonDTO> getPersonById(Long id) {
        return personRepository.findById(id).map(personMapper::toPersonDTO);
    }

    // Update a Person
    @Override
    public Optional<PersonDTO> updatePerson(Long id, PersonDTO personDTO) {
        return personRepository.findById(id).map(person -> {
            person.setName(personDTO.getName());
            person.setEmail(personDTO.getEmail());
            person.setRole(
                    Role.valueOf(personDTO.getRole()));
            Person updatedPerson = personRepository.save(person);
            return personMapper.toPersonDTO(updatedPerson);
        });
    }

    // Delete a Person
    @Override
    public boolean deletePerson(Long id) {
        if (personRepository.existsById(id)) {
            try {
                String url = deviceBackend + "person/" + id;
                //HttpHeaders headers = new HttpHeaders();
                //headers.set("Accept", "*/*");
                //HttpEntity<String> entity = new HttpEntity<>(headers);
                HttpEntity<String> entity = new HttpEntity<>(null);
                // Use exchange to send DELETE with headers
                restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);
            } catch (RestClientException e) {
                System.err.println("Failed to delete devices for person ID: " + id + ". Error: " + e.getMessage());
                return false;
            }
            personRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Long addDevice(Long id, PersonDevicesDTO personDevicesDTO) {
        Optional<Person> person= personRepository.findById(id);
        if(person.isEmpty())
            return null; //arunca exceptie mai tarziu
        else {
            String url = deviceBackend+ "assign/" + person.get().getId();
            System.out.println(url);
            DeviceDTO deviceDTO= new DeviceDTO();
            deviceDTO.setAddress(personDevicesDTO.getAddress());
            deviceDTO.setDescription(personDevicesDTO.getDescription());
            deviceDTO.setMaxEnergyConsumption(personDevicesDTO.getMaxEnergyConsumption());
            return restTemplate.postForObject(url,deviceDTO,Long.class);
        }
    }
    @Override
    public List<DeviceDTO> getDevices(Long id) {
        Optional<Person> person = personRepository.findById(id);
        if (person.isEmpty()) {
            throw new PersonNotFoundException("Person with ID " + id + " not found.");
        } else {
            String url = deviceBackend + "person/" + person.get().getId();
            HttpHeaders headers = new HttpHeaders();

            // Adaugă JWT-ul din SecurityContextHolder
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getCredentials() instanceof String) {
                String jwtToken = (String) authentication.getCredentials();
                headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken);
            }

            HttpEntity<String> entity = new HttpEntity<>(headers);
            return restTemplate.exchange(url, HttpMethod.GET, entity, new ParameterizedTypeReference<List<DeviceDTO>>() {}).getBody();
        }
    }

//    @Override
//    public List<DeviceDTO> getDevices(Long id) {
//        Optional<Person> person= personRepository.findById(id);
//        if(person.isEmpty())
//            throw new PersonNotFoundException("Person with ID " + id + " not found.");
//        else {
//            String url = deviceBackend+"person/" + person.get().getId();
//
//            return restTemplate.exchange(url, HttpMethod.GET, null, new ParameterizedTypeReference<List<DeviceDTO>>() {}).getBody();
//        }
//    }

    @Override
    public List<Person> getUsers() {
        return personRepository.findByRole(Role.CLIENT);
    }

    @Override
    public List<Person> getAdmins() {
        return personRepository.findByRole(Role.ADMIN);
    }

}