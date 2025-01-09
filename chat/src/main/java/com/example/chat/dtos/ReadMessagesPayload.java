package com.example.chat.dtos;

import lombok.Data;

@Data
public class ReadMessagesPayload {
    private Long chatRoomId;
    private String senderId;
    // getter, setter
}