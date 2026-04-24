package com.example.demo.repository;

import com.example.demo.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findByStatus(String status);
    List<ContactMessage> findByOrderByCreatedAtDesc();
    List<ContactMessage> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ContactMessage> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<ContactMessage> findTop5ByOrderByIdDesc();
    
    // Conversation threading methods
    List<ContactMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
    List<ContactMessage> findByConversationIdOrderByCreatedAtDesc(String conversationId);
    
    // Find all messages where user is either sender or recipient
    @Query("SELECT m FROM ContactMessage m WHERE m.userId = :userId OR m.recipientId = :userId ORDER BY m.createdAt DESC")
    List<ContactMessage> findAllUserMessages(@Param("userId") Long userId);
    
    // Find unread messages for user
    @Query("SELECT m FROM ContactMessage m WHERE m.recipientId = :userId AND m.isRead = false ORDER BY m.createdAt DESC")
    List<ContactMessage> findUnreadByRecipientId(@Param("userId") Long userId);
}