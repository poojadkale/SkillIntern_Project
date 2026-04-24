package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
public class ContactMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(nullable = false, length = 2000)
    private String message;
    
    @Column(nullable = false)
    private String status = "PENDING";
    
    @Column(length = 2000)
    private String adminResponse;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime respondedAt;
    
    private Long userId;
    
    // Direct Messaging Fields
    @Column(name = "recipient_id")
    private Long recipientId;
    
    @Column(name = "recipient_role")
    private String recipientRole;
    
    @Column(name = "recipient_email")
    private String recipientEmail;
    
    @Column(name = "recipient_name")
    private String recipientName;
    
    @Column(name = "responded_by")
    private Long respondedBy;
    
    @Column(name = "responded_by_name")
    private String respondedByName;
    
    @Column(name = "is_direct_message", columnDefinition = "boolean default false")
    private Boolean isDirectMessage = false;
    
    @Column(name = "source", columnDefinition = "varchar(50) default 'CONTACT_FORM'")
    private String source = "CONTACT_FORM";
    
    // Conversation Threading Fields
    @Column(name = "conversation_id")
    private String conversationId;
    
    @Column(name = "original_message_id")
    private Long originalMessageId;
    
    @Column(name = "is_read", columnDefinition = "boolean default false")
    private Boolean isRead = false;
    
    // Constructors
    public ContactMessage() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
    
    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    
    public Long getRespondedBy() { return respondedBy; }
    public void setRespondedBy(Long respondedBy) { this.respondedBy = respondedBy; }
    
    public String getRespondedByName() { return respondedByName; }
    public void setRespondedByName(String respondedByName) { this.respondedByName = respondedByName; }
    
    public Boolean isDirectMessage() { return isDirectMessage != null ? isDirectMessage : false; }
    public void setDirectMessage(Boolean directMessage) { this.isDirectMessage = directMessage != null ? directMessage : false; }
    
    public String getSource() { return source != null ? source : "CONTACT_FORM"; }
    public void setSource(String source) { this.source = source != null ? source : "CONTACT_FORM"; }
    
    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    
    public Long getOriginalMessageId() { return originalMessageId; }
    public void setOriginalMessageId(Long originalMessageId) { this.originalMessageId = originalMessageId; }
    
    public Boolean getIsRead() { return isRead != null ? isRead : false; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead != null ? isRead : false; }
}