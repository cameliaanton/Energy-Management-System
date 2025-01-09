package com.example.rabbitmq.consumer;

import com.example.rabbitmq.models.HourlyConsumption;
import com.example.rabbitmq.models.Info;
import com.example.rabbitmq.repository.HourlyConsumptionRepository;
import com.example.rabbitmq.service.NotificationService;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

@Service
public class RabbitMQJsonConsumer {
    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQJsonConsumer.class);
    private final RestTemplate restTemplate;
    private final HourlyConsumptionRepository hourlyConsumptionRepository;
    private final NotificationService notificationService;
    private static final Integer READS_PER_HOUR = 6;
    private final Map<Long, DeviceData> deviceDataMap = new HashMap<>();
    public RabbitMQJsonConsumer(RestTemplate restTemplate, HourlyConsumptionRepository hourlyConsumptionRepository, NotificationService notificationService) {
        this.restTemplate = restTemplate;
        this.hourlyConsumptionRepository = hourlyConsumptionRepository;
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "${rabbitmq.queue.jason.name}")
    public void consumeJsonMessage(Info info) {
        LOGGER.info(String.format("Received JSON message -> %s", info.toString()));

        long deviceId = info.getDeviceId();
        DeviceData deviceData = deviceDataMap.computeIfAbsent(deviceId, id -> new DeviceData());

        // Adăugăm valoarea curentă
        deviceData.addMeasurement(info.getMeasurementValue());

        if (deviceData.getMeasurementCount() == READS_PER_HOUR) {
            double averageConsumption = deviceData.calculateAverage();

            LocalDateTime timestamp = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(info.getTimestamp()), ZoneId.systemDefault()
            ).withMinute(0).withSecond(0).withNano(0);

            LOGGER.info(String.format("For hour %s the mean value for device %d was %f",
                    timestamp, deviceId, averageConsumption));

            if (averageConsumption > getMaxAllowedConsumption(deviceId)) {
                notificationService.sendConsumptionAlert(deviceId, averageConsumption, getMaxAllowedConsumption(deviceId));
            }

            // Procesăm media și resetăm datele pentru dispozitivul curent
            processHourlyConsumption(deviceId, timestamp, averageConsumption);
            deviceData.reset();
        }
    }
    private void processHourlyConsumption(Long deviceId, LocalDateTime timestamp, double consumption){

        HourlyConsumption hourlyConsumption= new HourlyConsumption(null,deviceId,timestamp,consumption);
        hourlyConsumptionRepository.save(hourlyConsumption);
        System.out.println("hourly consumption saved: "+hourlyConsumption);
    }

    private double getMaxAllowedConsumption(Long deviceId){
        //String url="http://localhost:8082/devices/"+deviceId+"/max-consumption";
        //String url="http://host.docker.internal:8082/devices/"+deviceId+"/max-consumption";
        String url="http://device-service:8080/devices/"+deviceId+"/max-consumption";
        try{
            LOGGER.info(url);
            Double maxConsumption= restTemplate.getForObject(url,Double.class);
            LOGGER.info("maxConsumption for deviceId "+ deviceId+ " is:"+maxConsumption);
            return maxConsumption!=null ? maxConsumption : Double.MAX_VALUE;
        }catch (Exception e){
            LOGGER.error("Error fetching maxAllowedConsumption for device " + deviceId, e);
            return Double.MAX_VALUE;
        }
    }
    private static class DeviceData {
        private double totalMeasurement = 0.0;
        @Getter
        private int measurementCount = 0;

        public void addMeasurement(double value) {
            totalMeasurement += value;
            measurementCount++;
        }

        public double calculateAverage() {
            return measurementCount == 0 ? 0.0 : totalMeasurement / measurementCount;
        }

        public void reset() {
            totalMeasurement = 0.0;
            measurementCount = 0;
        }
    }
}
