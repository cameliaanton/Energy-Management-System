package com.example.chat.service;

import com.example.chat.entities.ChatRoom;
import com.example.chat.repository.ChatRoomRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatRoomService {
    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Transactional
    public Optional<ChatRoom> getChatRoom(Long userId,Long adminId){
        return chatRoomRepository.findByUserIdAndAdminId(userId,adminId);
    }
    @Transactional
    public ChatRoom createChatRoom(Long userId, Long adminId) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setUserId(userId);
        chatRoom.setAdminId(adminId);
        chatRoom.setCreatedAt(LocalDateTime.now());
        chatRoom.setUpdatedAt(LocalDateTime.now());
        return chatRoomRepository.save(chatRoom);
    }
    @Transactional
    public List<ChatRoom> getActiveChatRoomsForAdmin(Long adminId) {
        return chatRoomRepository.findByAdminId(adminId);
    }
    @Transactional
    public List<ChatRoom> getActiveChatRoomsForUser(Long userId) {
        return chatRoomRepository.findByUserId(userId);
    }

    @Transactional
    public ChatRoom getChatRoomById(Long chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new IllegalArgumentException("Chat room not found"));
    }
}
