package com.example.rabbitmq.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }


    public void sendConsumptionAlert(Long deviceId, double consumption, double maxConsumption) {
        String alertMessage = String.format(
                "Alert: Device %d exceeded hourly consumption. Current: %.2f kWh, Max: %.2f kWh",
                deviceId, consumption, maxConsumption
        );

        messagingTemplate.convertAndSend("/topic/alerts/" + deviceId, alertMessage);
        LOGGER.info("Notification sent: " + alertMessage);
    }

}
