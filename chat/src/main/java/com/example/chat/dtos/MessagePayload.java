package com.example.chat.dtos;

import lombok.Data;

@Data
public class MessagePayload {
    private String chatRoomId;
    private String senderId;
    private String content;
}
