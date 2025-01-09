package com.example.rabbitmq;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RabbitmqApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
//		System.out.println("JWT_SECRET loaded: " + dotenv.get("JWT_SECRET"));
		SpringApplication.run(RabbitmqApplication.class, args);
	}

}
