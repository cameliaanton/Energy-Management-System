package com.example.demo.services.impl;

import com.example.demo.dtos.DeviceDTO;
import com.example.demo.dtos.mapper.DeviceMapper;
import com.example.demo.entities.Device;
import com.example.demo.entities.PersonDevices;
import com.example.demo.repositories.PersonDevicesRepository;
import com.example.demo.services.DeviceService;
import com.example.demo.services.PersonDevicesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PersonDevicesServiceServiceImpl implements PersonDevicesService {
    @Autowired
    private DeviceService deviceService;
    @Autowired
    private DeviceMapper deviceMapper;
    @Autowired
    private PersonDevicesRepository personDevicesRepository;
    @Override
    public PersonDevices addDevice(Long personId, DeviceDTO deviceDTO) {
        DeviceDTO created_deviceDTO= deviceService.createDevice(deviceDTO);

        PersonDevices personDevices= new PersonDevices();
        personDevices.setPersonId(personId);
        personDevices.setDevice(deviceMapper.toDevice(created_deviceDTO));
        return personDevicesRepository.save(personDevices);
    }

    @Override
    public List<DeviceDTO> getDevicesByPerson(Long id) {
        List<PersonDevices> personDevices=personDevicesRepository.findByPersonId(id);

        List<Device> devices= personDevices.stream().map(PersonDevices::getDevice)
                .collect(Collectors.toList());
        return deviceMapper.toListViewDto(devices);
    }

    @Override
    public void deletePersonAndDevices(Long personId) {
        List<PersonDevices> personDevicesList = personDevicesRepository.findByPersonId(personId);
        if(!personDevicesList.isEmpty())
        {
            for(PersonDevices personDevice: personDevicesList){
                Long deviceId =personDevice.getDevice().getId();

                personDevicesRepository.delete(personDevice);

                boolean deviceRef = personDevicesRepository.existsByDeviceId(deviceId);

                if(!deviceRef)
                    deviceService.deleteDevice(deviceId);
            }
        }
        System.out.println("o bine");

    }
}
