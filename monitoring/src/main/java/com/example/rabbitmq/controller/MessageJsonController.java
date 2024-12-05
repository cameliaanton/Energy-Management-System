package com.example.rabbitmq.controller;

import com.example.rabbitmq.models.Info;
import com.example.rabbitmq.publisher.RabbitMqJsonProducer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class MessageJsonController {
    private final RabbitMqJsonProducer jsonProducer;

    public MessageJsonController(RabbitMqJsonProducer jsonProducer) {
        this.jsonProducer = jsonProducer;
    }
    @PostMapping("/publish")
    public ResponseEntity<String> sendJsonMessage(@RequestBody Info info){
        jsonProducer.sendJsonMessage(info);
        return ResponseEntity.ok("Json message sent to rabbitMQ ...");
    }
}
