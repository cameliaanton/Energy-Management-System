package com.example.rabbitmq.consumer;

import com.example.rabbitmq.models.HourlyConsumption;
import com.example.rabbitmq.models.Info;
import com.example.rabbitmq.repository.HourlyConsumptionRepository;
import com.example.rabbitmq.service.NotificationService;
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
    private Integer dataPerHour=0;

    private final Map<String, Double> hourlyConsumptionMap = new HashMap<>();

    public RabbitMQJsonConsumer(RestTemplate restTemplate, HourlyConsumptionRepository hourlyConsumptionRepository, NotificationService notificationService) {
        this.restTemplate = restTemplate;
        this.hourlyConsumptionRepository = hourlyConsumptionRepository;
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "${rabbitmq.queue.jason.name}")
    public void consumeJsonMessage(Info info){

        LOGGER.info(String.format("Received JSON message -> %s",info.toString()));

        String deviceHourKey = String.valueOf(info.getDeviceId());

        double updatedConsumption = hourlyConsumptionMap.getOrDefault(deviceHourKey, 0.0) + info.getMeasurementValue();
        hourlyConsumptionMap.put(deviceHourKey, updatedConsumption);

        dataPerHour++;
        if (dataPerHour.equals(READS_PER_HOUR)) {
            updatedConsumption/=READS_PER_HOUR;

            LocalDateTime timestamp = LocalDateTime.ofInstant(Instant.ofEpochMilli(info.getTimestamp()), ZoneId.systemDefault())
                    .withMinute(0)
                    .withSecond(0)
                    .withNano(0);

            LOGGER.info(String.format("For hour %s the mean value was %f", timestamp, updatedConsumption));

            if (updatedConsumption > getMaxAllowedConsumption(info.getDeviceId())) {
                notificationService.sendConsumptionAlert(info.getDeviceId(), updatedConsumption,getMaxAllowedConsumption(info.getDeviceId()));
            }

            hourlyConsumptionMap.put(deviceHourKey, (double) 0);
            processHourlyConsumption(info.getDeviceId(), timestamp, updatedConsumption);

            dataPerHour = 0;
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
}
