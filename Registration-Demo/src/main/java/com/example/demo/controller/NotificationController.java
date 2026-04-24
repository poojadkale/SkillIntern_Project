package com.example.demo.controller;

import com.example.demo.entity.Notification;
import com.example.demo.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private ContactService contactService;

    @GetMapping("/count/{userId}")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        try {
            long count = contactService.getUnreadNotificationCount(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable Long userId) {
        try {
            List<Notification> notifications = contactService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch notifications"));
        }
    }
    
    // Get recent notifications (last 3)
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<?> getRecentNotifications(@PathVariable Long userId) {
        try {
            List<Notification> allNotifications = contactService.getUserNotifications(userId);
            List<Notification> recentNotifications = allNotifications.stream()
                .limit(3)
                .collect(Collectors.toList());
            return ResponseEntity.ok(recentNotifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch recent notifications"));
        }
    }

    @PutMapping("/{notificationId}/read/{userId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId, @PathVariable Long userId) {
        try {
            contactService.markNotificationAsRead(notificationId, userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/read-all/{userId}")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        try {
            contactService.markAllNotificationsAsRead(userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}