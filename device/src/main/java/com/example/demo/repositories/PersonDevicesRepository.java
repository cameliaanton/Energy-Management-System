package com.example.demo.repositories;

import com.example.demo.entities.PersonDevices;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersonDevicesRepository extends JpaRepository<PersonDevices,Long> {
    List<PersonDevices> findByPersonId( Long personId);

    boolean existsByDeviceId(Long deviceId);
}
