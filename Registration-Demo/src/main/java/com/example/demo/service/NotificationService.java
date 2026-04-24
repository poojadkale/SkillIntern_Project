package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.enums.Role;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;

    public void createNotification(Long userId, String title, String message, String type, String relatedId) {
        Notification notification = new Notification(userId, title, message, type, relatedId);
        notificationRepository.save(notification);
        System.out.println("🔔 Notification created for user " + userId + ": " + title);
    }

    public void notifyAllAdmins(String title, String message, String type, String relatedId) {
        userRepository.findByRole(Role.ADMIN).forEach(admin -> {
            createNotification(admin.getId(), title, message, type, relatedId);
        });
    }

    public void notifyAllStudents(String title, String message, String type, String relatedId) {
        userRepository.findByRole(Role.STUDENT).forEach(student -> {
            createNotification(student.getId(), title, message, type, relatedId);
        });
    }

    public void notifyCompany(Long companyUserId, String title, String message, String type, String relatedId) {
        createNotification(companyUserId, title, message, type, relatedId);
    }

    public void notifyStudent(Long studentUserId, String title, String message, String type, String relatedId) {
        createNotification(studentUserId, title, message, type, relatedId);
    }
}