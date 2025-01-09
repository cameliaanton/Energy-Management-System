package com.example.chat.service;

import com.example.chat.entities.ChatMessage;
import com.example.chat.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatMessageService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage saveMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getMessagesForChatRoom(Long chatRoomId) {
        return chatMessageRepository.findByChatRoomId(chatRoomId);
    }

    public void markAllMessagesAsRead(Long chatRoomId, String readerId) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessages(chatRoomId, readerId);
        System.out.println("mesaje"+unreadMessages);
        //System.out.println("Unread mess: "+unreadMessages);
        for (ChatMessage msg : unreadMessages) {
            msg.setRead(true);
        }
        //System.out.println("Read mess:"+unreadMessages);
        chatMessageRepository.saveAll(unreadMessages);
    }

}
