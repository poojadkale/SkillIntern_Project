package com.example.demo.controller;

import com.example.demo.dto.AdminReplyDTO;
import com.example.demo.dto.ContactRequestDTO;
import com.example.demo.dto.ContactResponseDTO;
import com.example.demo.entity.ContactMessage;
import com.example.demo.entity.User;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.ContactRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/contact")
public class ContactController {
    
    @Autowired
    private ContactService contactService;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ContactRepository contactRepository;
    
    // ==================== USER ENDPOINTS ====================
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitMessage(@Valid @RequestBody ContactRequestDTO request) {
        try {
            ContactResponseDTO response = contactService.saveMessage(request);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Your message has been sent successfully. We'll get back to you soon.");
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/user/{userId}/messages")
    public ResponseEntity<?> getUserMessages(@PathVariable Long userId) {
        try {
            List<ContactResponseDTO> messages = contactService.getMessagesByUserId(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/conversations")
    public ResponseEntity<?> getUserConversations(@PathVariable Long userId) {
        try {
            List<ContactResponseDTO> conversations = contactService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/conversation/{conversationId}/messages")
    public ResponseEntity<?> getConversationMessages(@PathVariable String conversationId) {
        try {
            List<ContactResponseDTO> messages = contactService.getConversationMessages(conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/recipient/{recipientId}/messages")
    public ResponseEntity<?> getRecipientMessages(@PathVariable Long recipientId) {
        try {
            List<ContactResponseDTO> messages = contactService.getMessagesByRecipientId(recipientId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/user/{userId}/reply")
    public ResponseEntity<?> sendUserReply(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> replyData) {
        try {
            System.out.println("=== sendUserReply endpoint called ===");
            System.out.println("User ID: " + userId);
            System.out.println("Reply data: " + replyData);
            
            Long originalMessageId = ((Number) replyData.get("originalMessageId")).longValue();
            String content = (String) replyData.get("content");
            Long recipientId = ((Number) replyData.get("recipientId")).longValue();
            String recipientRole = (String) replyData.get("recipientRole");
            String subject = (String) replyData.get("subject");
            
            User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
            
            String recipientName = "";
            String recipientEmail = "";
            
            if ("STUDENT".equals(recipientRole)) {
                var student = studentRepository.findByUserId(recipientId).orElse(null);
                if (student != null) {
                    recipientName = student.getUser().getFullName();
                    recipientEmail = student.getUser().getEmail();
                }
            } else if ("COMPANY".equals(recipientRole)) {
                var company = companyRepository.findByUserId(recipientId).orElse(null);
                if (company != null) {
                    recipientName = company.getCompanyName();
                    recipientEmail = company.getUser().getEmail();
                }
            } else {
                User recipient = userRepository.findById(recipientId).orElse(null);
                if (recipient != null) {
                    recipientName = recipient.getFullName();
                    recipientEmail = recipient.getEmail();
                }
            }
            
            ContactResponseDTO response = contactService.sendUserReply(
                userId, sender.getFullName(), sender.getEmail(),
                originalMessageId, recipientId, recipientRole, 
                recipientName, recipientEmail, subject, content
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Reply sent successfully");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("Error sending reply: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // ==================== ADMIN ENDPOINTS ====================
    
    @GetMapping("/admin/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllMessages() {
        try {
            List<ContactResponseDTO> messages = contactService.getAllMessages();
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/admin/messages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMessageById(@PathVariable Long id) {
        try {
            ContactResponseDTO message = contactService.getMessageById(id);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/admin/messages/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMessagesByStatus(@PathVariable String status) {
        try {
            List<ContactResponseDTO> messages = contactService.getMessagesByStatus(status);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/admin/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingCount() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("count", contactService.getPendingCount());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/admin/messages/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> replyToMessage(@PathVariable Long id, @Valid @RequestBody AdminReplyDTO reply) {
        try {
            User admin = userRepository.findById(8L).orElse(null);
            if (admin != null) {
                reply.setAdminName(admin.getFullName());
                reply.setAdminEmail(admin.getEmail());
            }
            
            ContactResponseDTO response = contactService.replyToMessage(id, reply);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Reply sent successfully");
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/admin/messages/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            ContactResponseDTO response = contactService.updateStatus(id, status);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Status updated successfully");
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/admin/messages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        try {
            contactService.deleteMessage(id);
            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("message", "Message deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/admin/direct-message")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendDirectMessage(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("========== RECEIVED DIRECT MESSAGE REQUEST ==========");
            System.out.println("Request body: " + request);
            
            Long recipientUserId = Long.valueOf(request.get("recipientId").toString());
            String recipientRole = request.get("recipientRole").toString();
            String subject = request.get("subject").toString();
            String message = request.get("message").toString();
            
            User admin = userRepository.findById(8L)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            ContactResponseDTO response = contactService.sendDirectMessage(
                admin.getId(),
                admin.getFullName(),
                admin.getEmail(),
                recipientUserId,
                recipientRole,
                subject,
                message
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Message sent successfully to " + recipientRole);
            result.put("data", response);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/admin/users-list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersList() {
        try {
            List<Map<String, Object>> studentList = studentRepository.findAll().stream().map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getUser().getId());
                map.put("name", s.getUser().getFullName());
                map.put("email", s.getUser().getEmail());
                map.put("role", "STUDENT");
                return map;
            }).collect(Collectors.toList());
            
            List<Map<String, Object>> companyList = companyRepository.findAll().stream().map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getUser().getId());
                map.put("name", c.getCompanyName());
                map.put("email", c.getUser().getEmail());
                map.put("role", "COMPANY");
                return map;
            }).collect(Collectors.toList());
            
            List<Map<String, Object>> allUsers = new ArrayList<>();
            allUsers.addAll(studentList);
            allUsers.addAll(companyList);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                "students", studentList,
                "companies", companyList,
                "all", allUsers
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/debug/last-messages")
    public ResponseEntity<?> getLastMessages() {
        try {
            List<ContactMessage> messages = contactRepository.findTop5ByOrderByIdDesc();
            List<Map<String, Object>> result = messages.stream().map(msg -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", msg.getId());
                map.put("subject", msg.getSubject());
                map.put("recipientId", msg.getRecipientId());
                map.put("recipientRole", msg.getRecipientRole());
                map.put("recipientName", msg.getRecipientName());
                map.put("source", msg.getSource());
                map.put("createdAt", msg.getCreatedAt());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}