package com.example.chat.dtos;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
public class TypingNotification {
    private Long chatRoomId;
    private String senderId; // The user typing
}
