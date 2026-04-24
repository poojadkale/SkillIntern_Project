package com.example.demo.service;

import com.example.demo.dto.AdminReplyDTO;
import com.example.demo.dto.ContactRequestDTO;
import com.example.demo.dto.ContactResponseDTO;
import com.example.demo.entity.ContactMessage;
import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.repository.ContactRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContactService {
    
    @Autowired
    private ContactRepository contactRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private CompanyRepository companyRepository;
    
    // ==================== SAVE MESSAGE ====================
    
    @Transactional
    public ContactResponseDTO saveMessage(ContactRequestDTO request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setSubject(request.getSubject());
        message.setMessage(request.getMessage());
        message.setStatus("PENDING");
        message.setCreatedAt(LocalDateTime.now());
        
        if (request.getUserId() != null) {
            message.setUserId(request.getUserId());
        }
        
        ContactMessage saved = contactRepository.save(message);
        
        createAdminNotifications(saved);
        
        if (request.getUserId() != null) {
            createUserNotification(request.getUserId(), saved);
        }
        
        return convertToDTO(saved);
    }
    
    private void createAdminNotifications(ContactMessage message) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            Notification notification = new Notification(
                admin.getId(),
                "New Contact Message",
                "New message from " + message.getName() + ": " + message.getSubject(),
                "CONTACT",
                message.getId().toString()
            );
            notificationRepository.save(notification);
        }
    }
    
    private void createUserNotification(Long userId, ContactMessage message) {
        Notification notification = new Notification(
            userId,
            "Message Sent Successfully",
            "Your message '" + message.getSubject() + "' has been sent. We'll respond within 24 hours.",
            "CONTACT",
            message.getId().toString()
        );
        notificationRepository.save(notification);
    }
    
    // ==================== GET MESSAGES ====================
    
    public List<ContactResponseDTO> getAllMessages() {
        return contactRepository.findByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ContactResponseDTO> getMessagesByStatus(String status) {
        return contactRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ContactResponseDTO getMessageById(Long id) {
        ContactMessage message = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        return convertToDTO(message);
    }
    
    public List<ContactResponseDTO> getMessagesByUserId(Long userId) {
        return contactRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ContactResponseDTO> getMessagesByRecipientId(Long recipientId) {
        System.out.println("Fetching messages for recipient ID: " + recipientId);
        List<ContactMessage> messages = contactRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
        System.out.println("Found " + messages.size() + " messages");
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // ==================== ADMIN REPLY ====================
    
    @Transactional
    public ContactResponseDTO replyToMessage(Long id, AdminReplyDTO reply) {
        ContactMessage message = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        // Use existing conversationId or create a new one
        String conversationId = message.getConversationId();
        if (conversationId == null || conversationId.isEmpty()) {
            conversationId = "CONV_" + System.currentTimeMillis() + "_" + id;
            message.setConversationId(conversationId);
            contactRepository.save(message);
        }
        
        System.out.println("=== Admin Replying to Message ===");
        System.out.println("Original Message ID: " + id);
        System.out.println("Using Conversation ID: " + conversationId);
        
        // Create a new reply message - USE SAME CONVERSATION ID
        ContactMessage replyMessage = new ContactMessage();
        replyMessage.setName(reply.getAdminName() != null ? reply.getAdminName() : "Admin");
        replyMessage.setEmail(reply.getAdminEmail() != null ? reply.getAdminEmail() : "admin@skillintern.com");
        replyMessage.setSubject(message.getSubject());
        replyMessage.setMessage(reply.getResponse());
        replyMessage.setStatus(reply.getStatus() != null ? reply.getStatus() : "REPLIED");
        replyMessage.setCreatedAt(LocalDateTime.now());
        replyMessage.setRespondedAt(LocalDateTime.now());
        replyMessage.setUserId(8L); // Admin user ID
        replyMessage.setRecipientId(message.getUserId());
        replyMessage.setRecipientRole("COMPANY");
        replyMessage.setDirectMessage(true);
        replyMessage.setSource("ADMIN_REPLY");
        replyMessage.setOriginalMessageId(id);
        replyMessage.setConversationId(conversationId);
        replyMessage.setIsRead(false);
        
        ContactMessage saved = contactRepository.save(replyMessage);
        
        // Update original message
        message.setAdminResponse(reply.getResponse());
        message.setRespondedAt(LocalDateTime.now());
        message.setStatus(reply.getStatus() != null ? reply.getStatus() : "REPLIED");
        contactRepository.save(message);
        
        // Create notification
        if (message.getUserId() != null) {
            Notification notification = new Notification(
                message.getUserId(),
                "Reply to Your Message",
                "Admin replied to your message: " + message.getSubject(),
                "CONTACT_REPLY",
                saved.getId().toString()
            );
            notificationRepository.save(notification);
        }
        
        return convertToDTO(saved);
    }
    
    // ==================== USER REPLY ====================
    
    @Transactional
    public ContactResponseDTO sendUserReply(Long userId, String userName, String userEmail,
                                            Long originalMessageId, Long recipientId, String recipientRole,
                                            String recipientName, String recipientEmail, 
                                            String subject, String content) {
        
        System.out.println("=== Sending User Reply ===");
        System.out.println("From User ID: " + userId);
        System.out.println("Original Message ID: " + originalMessageId);
        
        // Get the original message
        ContactMessage originalMessage = contactRepository.findById(originalMessageId)
            .orElseThrow(() -> new RuntimeException("Original message not found"));
        
        // Use existing conversationId or create a new one
        String conversationId = originalMessage.getConversationId();
        if (conversationId == null || conversationId.isEmpty()) {
            conversationId = "CONV_" + System.currentTimeMillis() + "_" + originalMessageId;
            originalMessage.setConversationId(conversationId);
            contactRepository.save(originalMessage);
        }
        
        System.out.println("Using Conversation ID: " + conversationId);
        
        // Create reply message - USE SAME CONVERSATION ID
        ContactMessage replyMessage = new ContactMessage();
        replyMessage.setName(userName);
        replyMessage.setEmail(userEmail);
        replyMessage.setSubject(originalMessage.getSubject());
        replyMessage.setMessage(content);
        replyMessage.setStatus("REPLIED");
        replyMessage.setCreatedAt(LocalDateTime.now());
        replyMessage.setUserId(userId);
        replyMessage.setRecipientId(recipientId);
        replyMessage.setRecipientRole(recipientRole);
        replyMessage.setRecipientEmail(recipientEmail);
        replyMessage.setRecipientName(recipientName);
        replyMessage.setDirectMessage(true);
        replyMessage.setSource("USER_REPLY");
        replyMessage.setOriginalMessageId(originalMessageId);
        replyMessage.setConversationId(conversationId);
        replyMessage.setIsRead(false);
        
        ContactMessage saved = contactRepository.save(replyMessage);
        
        // Update original message status
        originalMessage.setStatus("REPLIED");
        contactRepository.save(originalMessage);
        
        // Create notification for recipient
        Notification notification = new Notification(
            recipientId,
            "New Reply to Your Message",
            "You have received a reply from " + userName,
            "MESSAGE_REPLY",
            saved.getId().toString()
        );
        notificationRepository.save(notification);
        
        return convertToDTO(saved);
    }
    
    // ==================== CONVERSATIONS ====================
    
    public List<ContactResponseDTO> getUserConversations(Long userId) {
        List<ContactMessage> messages = contactRepository.findAllUserMessages(userId);
        
        Map<String, List<ContactMessage>> groupedMessages = new LinkedHashMap<>();
        
        for (ContactMessage msg : messages) {
            String convId = msg.getConversationId();
            if (convId == null || convId.isEmpty()) {
                Long originalId = msg.getOriginalMessageId() != null ? msg.getOriginalMessageId() : msg.getId();
                convId = "CONV_" + originalId;
                msg.setConversationId(convId);
                contactRepository.save(msg);
            }
            
            groupedMessages.computeIfAbsent(convId, k -> new ArrayList<>()).add(msg);
        }
        
        List<ContactResponseDTO> conversations = new ArrayList<>();
        
        for (Map.Entry<String, List<ContactMessage>> entry : groupedMessages.entrySet()) {
            List<ContactMessage> convMessages = entry.getValue();
            convMessages.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
            
            ContactMessage latestMessage = convMessages.get(convMessages.size() - 1);
            
            ContactResponseDTO dto = convertToDTO(latestMessage);
            dto.setConversationId(entry.getKey());
            dto.setMessageCount(convMessages.size());
            
            conversations.add(dto);
        }
        
        conversations.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        return conversations;
    }
    
    public List<ContactResponseDTO> getConversationMessages(String conversationId) {
        List<ContactMessage> messages = contactRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        System.out.println("Found " + messages.size() + " messages for conversation: " + conversationId);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // ==================== UPDATE & DELETE ====================
    
    @Transactional
    public ContactResponseDTO updateStatus(Long id, String status) {
        ContactMessage message = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        message.setStatus(status);
        ContactMessage updated = contactRepository.save(message);
        return convertToDTO(updated);
    }
    
    @Transactional
    public void deleteMessage(Long id) {
        contactRepository.deleteById(id);
    }
    
    public long getPendingCount() {
        return contactRepository.findByStatus("PENDING").size();
    }
    
    // ==================== DIRECT MESSAGE ====================
    
 // Make sure your sendDirectMessage method in ContactService.java looks like this:

    @Transactional
    public ContactResponseDTO sendDirectMessage(Long adminId, String adminName, String adminEmail,
                                                 Long recipientUserId, String recipientRole, 
                                                 String subject, String message) {
        
        System.out.println("=========================================");
        System.out.println("SENDING DIRECT MESSAGE");
        System.out.println("=========================================");
        System.out.println("Admin ID: " + adminId);
        System.out.println("Recipient User ID: " + recipientUserId);
        System.out.println("Recipient Role: " + recipientRole);
        
        String recipientName = "";
        String recipientEmail = "";
        Long actualRecipientId = recipientUserId;
        
        if ("STUDENT".equals(recipientRole)) {
            var student = studentRepository.findByUserId(recipientUserId).orElse(null);
            if (student != null && student.getUser() != null) {
                recipientName = student.getUser().getFullName();
                recipientEmail = student.getUser().getEmail();
                actualRecipientId = student.getUser().getId();
                System.out.println("Found STUDENT: " + recipientName + " (User ID: " + actualRecipientId + ")");
            } else {
                throw new RuntimeException("Student not found with User ID: " + recipientUserId);
            }
        } else if ("COMPANY".equals(recipientRole)) {
            var company = companyRepository.findByUserId(recipientUserId).orElse(null);
            if (company != null) {
                recipientName = company.getCompanyName();
                if (company.getUser() != null) {
                    recipientEmail = company.getUser().getEmail();
                    actualRecipientId = company.getUser().getId();
                }
                System.out.println("Found COMPANY: " + recipientName + " (User ID: " + actualRecipientId + ")");
            } else {
                throw new RuntimeException("Company not found with User ID: " + recipientUserId);
            }
        }
        
        String conversationId = "CONV_" + System.currentTimeMillis() + "_DIRECT_" + recipientUserId;
        
        ContactMessage contactMessage = new ContactMessage();
        contactMessage.setName(adminName);
        contactMessage.setEmail(adminEmail);
        contactMessage.setSubject(subject);
        contactMessage.setMessage(message);
        contactMessage.setStatus("REPLIED");
        contactMessage.setAdminResponse(message);
        contactMessage.setRespondedAt(LocalDateTime.now());
        contactMessage.setRespondedBy(adminId);
        contactMessage.setRespondedByName(adminName);
        contactMessage.setRecipientId(actualRecipientId);
        contactMessage.setRecipientRole(recipientRole);
        contactMessage.setRecipientEmail(recipientEmail);
        contactMessage.setRecipientName(recipientName);
        contactMessage.setDirectMessage(true);
        contactMessage.setSource("ADMIN_INITIATED");
        contactMessage.setCreatedAt(LocalDateTime.now());
        contactMessage.setConversationId(conversationId);
        contactMessage.setIsRead(false);
        contactMessage.setUserId(adminId); // IMPORTANT: Set sender as admin
        
        ContactMessage saved = contactRepository.save(contactMessage);
        System.out.println("=== MESSAGE SAVED ===");
        System.out.println("Message ID: " + saved.getId());
        System.out.println("Sender (userId): " + saved.getUserId());
        System.out.println("Recipient ID: " + saved.getRecipientId());
        System.out.println("Recipient Name: " + saved.getRecipientName());
        System.out.println("Recipient Role: " + saved.getRecipientRole());
        System.out.println("Conversation ID: " + saved.getConversationId());
        
        // Create notification for the recipient
        Notification notification = new Notification(
            actualRecipientId,
            "New Message from Admin",
            "You have received a new message: " + subject,
            "DIRECT_MESSAGE",
            saved.getId().toString()
        );
        notificationRepository.save(notification);
        System.out.println("Notification sent to User ID: " + actualRecipientId);
        System.out.println("=========================================");
        
        return convertToDTO(saved);
    }
    
    // ==================== NOTIFICATIONS ====================
    
    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public void markNotificationAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
    
    public void markAllNotificationsAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification notification : notifications) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(notifications);
    }
    
    // ==================== CONVERTER ====================
    
    private ContactResponseDTO convertToDTO(ContactMessage message) {
        ContactResponseDTO dto = new ContactResponseDTO();
        dto.setId(message.getId());
        dto.setName(message.getName());
        dto.setEmail(message.getEmail());
        dto.setSubject(message.getSubject());
        dto.setMessage(message.getMessage());
        dto.setStatus(message.getStatus());
        dto.setAdminResponse(message.getAdminResponse());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setRespondedAt(message.getRespondedAt());
        dto.setUserId(message.getUserId());
        dto.setRecipientId(message.getRecipientId());
        dto.setRecipientRole(message.getRecipientRole());
        dto.setRecipientEmail(message.getRecipientEmail());
        dto.setRecipientName(message.getRecipientName());
        dto.setDirectMessage(message.isDirectMessage());
        dto.setSource(message.getSource());
        dto.setConversationId(message.getConversationId());
        return dto;
    }
}