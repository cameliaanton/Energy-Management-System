package com.example.chat.repository;

import com.example.chat.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomId(Long chatRoomId);

    @Query("SELECT m FROM ChatMessage m " +
            "WHERE m.chatRoom.id = :chatRoomId " +
            "AND m.recipientId = :readerId " +
            "AND m.read = false")
    List<ChatMessage> findUnreadMessages(@Param("chatRoomId") Long chatRoomId,
                                         @Param("readerId") String readerId);
}
