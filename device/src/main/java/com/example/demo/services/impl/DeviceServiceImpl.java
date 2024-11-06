package com.example.demo.services.impl;


import com.example.demo.dtos.DeviceDTO;
import com.example.demo.dtos.DeviceUpdateDTO;
import com.example.demo.dtos.mapper.DeviceMapper;
import com.example.demo.entities.Device;
import com.example.demo.repositories.DeviceRepository;
import com.example.demo.services.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DeviceServiceImpl implements DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private DeviceMapper deviceMapper;

    // Create a new Person
    @Override
    public DeviceDTO createDevice(DeviceDTO deviceDTO) {
        Device device = deviceMapper.toDevice(deviceDTO);
        Device savedDevice = deviceRepository.save(device);
        return deviceMapper.toDeviceDTO(savedDevice);
    }

    // Retrieve all Persons
    @Override
    public List<DeviceDTO> getAllDevices() {
        return deviceRepository.findAll()
                .stream()
                .map(deviceMapper::toDeviceDTO)
                .collect(Collectors.toList());
    }

    // Retrieve a Person by ID
    @Override
    public Optional<DeviceDTO> getDeviceById(Long id) {
        return deviceRepository.findById(id).map(deviceMapper::toDeviceDTO);
    }

    // Update a Person
    @Override
    public Optional<DeviceDTO> updateDevice(Long id, DeviceUpdateDTO deviceDTO) {
        return deviceRepository.findById(id).map(device -> {
            device.setAddress(deviceDTO.getAddress());
            device.setDescription(deviceDTO.getDescription());
            device.setMaxEnergyConsumption(deviceDTO.getMaxEnergyConsumption());
            Device updatedDevice = deviceRepository.save(device);
            return deviceMapper.toDeviceDTO(updatedDevice);
        });
    }

    // Delete a Person
    @Override
    public boolean deleteDevice(Long id) {
        if (deviceRepository.existsById(id)) {
            deviceRepository.deleteById(id);
            return true;
        }
        return false;
    }
}