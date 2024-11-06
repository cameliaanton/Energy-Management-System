package com.example.demo.services;

import com.example.demo.dtos.DeviceDTO;
import com.example.demo.dtos.DeviceUpdateDTO;

import java.util.List;
import java.util.Optional;

public interface DeviceService {
    DeviceDTO createDevice(DeviceDTO deviceDTO);

    List<DeviceDTO> getAllDevices();

    Optional<DeviceDTO> getDeviceById(Long id);

    Optional<DeviceDTO> updateDevice(Long id, DeviceUpdateDTO deviceDTO);

    boolean deleteDevice(Long id);

}
