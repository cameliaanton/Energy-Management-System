package com.example.chat.controller;

import com.example.chat.dtos.MessagePayload;
import com.example.chat.dtos.MessageResponseDto;
import com.example.chat.dtos.ReadMessagesPayload;
import com.example.chat.dtos.TypingNotification;
import com.example.chat.entities.ChatMessage;
import com.example.chat.entities.ChatRoom;
import com.example.chat.service.ChatMessageService;
import com.example.chat.service.ChatRoomService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private ChatMessageService chatMessageService;

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.typing")
    @Transactional
    public void sendTypingNotification(@Payload TypingNotification typingNotification) {
        ChatRoom chatRoom = chatRoomService.getChatRoomById(typingNotification.getChatRoomId());
        String recipientId = typingNotification.getSenderId().equals(chatRoom.getUserId().toString())
                ? chatRoom.getAdminId().toString()
                : chatRoom.getUserId().toString();

        messagingTemplate.convertAndSend("/topic/typing-" + recipientId, typingNotification);
    }

    @MessageMapping("/chat.read")
    public void markMessageAsRead(@Payload ReadMessagesPayload payload) {
        ChatRoom chatRoom = chatRoomService.getChatRoomById(payload.getChatRoomId());
        if (chatRoom == null) {
            throw new IllegalArgumentException("Chat room does not exist.");
        }
        chatMessageService.markAllMessagesAsRead(chatRoom.getId(), payload.getSenderId());

        String recipientId = payload.getSenderId().equals(chatRoom.getUserId().toString())
                ? chatRoom.getAdminId().toString()
                : chatRoom.getUserId().toString();

        System.out.println("sender:"+payload.getSenderId());
        System.out.println("receiver:"+ recipientId);
        messagingTemplate.convertAndSend("/topic/read-"+recipientId, "All messages read");
    }

    @GetMapping("/room/{userId}/{adminId}")
    public ResponseEntity<ChatRoom> getChatRoom(@PathVariable Long userId, @PathVariable Long adminId){
        Optional<ChatRoom> chatRoom= chatRoomService.getChatRoom(userId,adminId);
        System.out.println(chatRoom);
        return chatRoom.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.ok(chatRoomService.createChatRoom(userId, adminId)));
        // return chatRoom.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

//    @PostMapping("/createRoom/{userId}/{adminId}")
//    public ResponseEntity<ChatRoom> createChatRoom(@PathVariable Long userId,@PathVariable Long adminId) {
//        ChatRoom chatRoom = chatRoomService.createChatRoom(userId,adminId);
//        return ResponseEntity.ok(chatRoom);
//    }

    @GetMapping("/messages/{chatRoomId}")
    public ResponseEntity<List<MessageResponseDto>> getMessages(@PathVariable Long chatRoomId) {
        List<ChatMessage> messages = chatMessageService.getMessagesForChatRoom(chatRoomId);
        List<MessageResponseDto> response = messages.stream().map(message -> {
            MessageResponseDto dto = new MessageResponseDto();
            dto.setId(message.getId());
            dto.setSenderId(message.getSenderId());
            dto.setRecipientId(message.getRecipientId());
            dto.setContent(message.getContent());
            dto.setRead(message.isRead());
            dto.setTimestamp(message.getTimestamp());
            return dto;
        }).toList();
        return ResponseEntity.ok(response);
    }


    @MessageMapping("/sendMessage")
    @Transactional
    public void sendMessage(@Payload MessagePayload messagePayload) {
        logger.info("Received message payload: {}", messagePayload);

        if (messagePayload.getChatRoomId() == null || messagePayload.getSenderId() == null || messagePayload.getContent() == null) {
            throw new IllegalArgumentException("Invalid message payload. Missing required fields.");
        }

        ChatRoom chatRoom = chatRoomService.getChatRoomById(Long.valueOf(messagePayload.getChatRoomId()));
        if (chatRoom == null) {
            throw new IllegalArgumentException("Chat room does not exist.");
        }

        if (chatRoom.getUserId() == null || chatRoom.getAdminId() == null) {
            throw new IllegalArgumentException("Chat room is missing user or admin information.");
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setChatRoom(chatRoom);
        chatMessage.setSenderId(messagePayload.getSenderId());
        chatMessage.setContent(messagePayload.getContent());
        chatMessage.setRead(false);
        String recipientId = messagePayload.getSenderId().equals(chatRoom.getUserId().toString())
                ? chatRoom.getAdminId().toString()
                : chatRoom.getUserId().toString();
        chatMessage.setRecipientId(recipientId);

        //System.out.println(chatMessage);
        ChatMessage savedMessage = chatMessageService.saveMessage(chatMessage);
        logger.info("Saved message: {}", savedMessage);

        MessageResponseDto dto = new MessageResponseDto();
        dto.setId(savedMessage.getId());
        dto.setSenderId(savedMessage.getSenderId());
        dto.setRecipientId(savedMessage.getRecipientId());
        dto.setContent(savedMessage.getContent());
        dto.setRead(savedMessage.isRead());
        dto.setTimestamp(savedMessage.getTimestamp());
        dto.setChatRoomId(savedMessage.getChatRoom().getId()); // Include chatRoomId

        messagingTemplate.convertAndSend("/topic/messages-" + recipientId, dto);

    }

    @GetMapping("/rooms/admin/{adminId}")
    public ResponseEntity<List<ChatRoom>> getAdminRooms(@PathVariable Long adminId){
        List<ChatRoom> chatRooms= chatRoomService.getActiveChatRoomsForAdmin(adminId);
        return ResponseEntity.ok(chatRooms);
    }
    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoom>> getUserRooms(@PathVariable Long userId){
        List<ChatRoom> chatRooms= chatRoomService.getActiveChatRoomsForUser(userId);
        return ResponseEntity.ok(chatRooms);
    }
}
