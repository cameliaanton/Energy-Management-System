package com.example.demo.dtos.mapper;

import com.example.demo.dtos.DeviceDTO;
import com.example.demo.entities.Device;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DeviceMapper {

    DeviceDTO toDeviceDTO(Device device);
    Device toDevice(DeviceDTO deviceDTO);
    List<DeviceDTO> toListViewDto(List<Device> devicesList);

}