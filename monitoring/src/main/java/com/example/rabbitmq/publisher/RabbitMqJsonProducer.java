package com.example.rabbitmq.publisher;

import com.example.rabbitmq.models.Info;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RabbitMqJsonProducer {

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routing.json.key}")
    private String routingJsonKey;

    private static final Logger LOGGER= LoggerFactory.getLogger(RabbitMqJsonProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public RabbitMqJsonProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendJsonMessage(Info info){
        LOGGER.info(String.format("Json message sent -> %s",info.toString()));
        rabbitTemplate.convertAndSend(exchange,routingJsonKey,info);
    }
}
