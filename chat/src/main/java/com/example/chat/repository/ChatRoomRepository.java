package com.example.chat.repository;

import com.example.chat.entities.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByAdminId(Long adminId);
    List<ChatRoom> findByUserId(Long userId);
    @Query("SELECT c FROM ChatRoom c WHERE c.userId = :userId AND c.adminId = :adminId")
    Optional<ChatRoom> findByUserIdAndAdminId(@Param("userId") Long userId, @Param("adminId") Long adminId);}
