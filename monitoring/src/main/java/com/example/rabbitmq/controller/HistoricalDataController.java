package com.example.rabbitmq.controller;

import com.example.rabbitmq.models.HourlyConsumption;
import com.example.rabbitmq.repository.HourlyConsumptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class HistoricalDataController {

    private final HourlyConsumptionRepository repository;

    public HistoricalDataController(HourlyConsumptionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/historical-consumption/{deviceId}")
    public ResponseEntity<?> getHistoricalConsumption(
            @PathVariable Long deviceId,
            @RequestParam("date") LocalDate date) {
        try {
            if (deviceId == null || date == null) {
                return ResponseEntity.badRequest().body("Device ID and date must be provided.");
            }

            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            List<HourlyConsumption> data = repository.findByDeviceIdAndDay(deviceId, startOfDay, endOfDay);

            if (data.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No data found for the given device and date.");
            }

            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while retrieving historical data: " + e.getMessage());
        }
    }

}
