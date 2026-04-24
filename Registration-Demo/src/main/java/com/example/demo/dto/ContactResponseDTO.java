package com.example.demo.dto;

import java.time.LocalDateTime;

public class ContactResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String subject;
    private String message;
    private String status;
    private String adminResponse;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private Long userId;
    
    // Direct Messaging Fields
    private Long recipientId;
    private String recipientRole;
    private String recipientEmail;
    private String recipientName;
    private boolean isDirectMessage;
    private String source;
    
    // Conversation Fields
    private String conversationId;
    private Integer messageCount;
    
    public ContactResponseDTO() {}
    
    // Getters and Setters - Existing
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
    
    // Getters and Setters - Direct Messaging
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
    
    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    
    public boolean isDirectMessage() { return isDirectMessage; }
    public void setDirectMessage(boolean directMessage) { isDirectMessage = directMessage; }
    
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    
    // Getters and Setters - Conversation
    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    
    public Integer getMessageCount() { return messageCount; }
    public void setMessageCount(Integer messageCount) { this.messageCount = messageCount; }
}