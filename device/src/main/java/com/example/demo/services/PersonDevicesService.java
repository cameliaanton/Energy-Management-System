package com.example.demo.services;

import com.example.demo.dtos.DeviceDTO;
import com.example.demo.entities.PersonDevices;

import java.util.List;

public interface PersonDevicesService {
    public PersonDevices addDevice(Long personId, DeviceDTO deviceDTO);

    List<DeviceDTO> getDevicesByPerson(Long id);

    void deletePersonAndDevices(Long personId);
}
