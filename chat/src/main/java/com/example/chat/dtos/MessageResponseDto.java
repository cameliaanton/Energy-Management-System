package com.example.chat.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageResponseDto {
    private Long id;
    private String senderId;
    private String recipientId;
    private String content;
    private boolean read;
    private LocalDateTime timestamp;
    private Long chatRoomId;
}
