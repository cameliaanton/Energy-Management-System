package com.example.demo.dtos.mapper;

import com.example.demo.dtos.PersonDTO;
import com.example.demo.dtos.PersonRegisterDTO;
import com.example.demo.entities.Person;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PersonMapper {

    // Entity to DTO mapping
    @Mapping(source = "role", target = "role")
    PersonDTO toPersonDTO(Person person);

    // DTO to Entity mapping
    @Mapping(source = "role", target = "role")
    Person toPerson(PersonRegisterDTO personDTO);


}