package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody Map<String, String> userData) {
        try {
            System.out.println("=== updateUser endpoint called ===");
            System.out.println("User ID: " + userId);
            System.out.println("User Data: " + userData);
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found with ID: " + userId);
                return ResponseEntity.status(404).body(error);
            }
            
            User user = userOpt.get();
            
            if (userData.containsKey("fullName") && userData.get("fullName") != null) {
                user.setFullName(userData.get("fullName"));
                System.out.println("Updated fullName to: " + userData.get("fullName"));
            }
            if (userData.containsKey("email") && userData.get("email") != null) {
                user.setEmail(userData.get("email"));
                System.out.println("Updated email to: " + userData.get("email"));
            }
            if (userData.containsKey("phone") && userData.get("phone") != null) {
                user.setPhone(userData.get("phone"));
                System.out.println("Updated phone to: " + userData.get("phone"));
            }
            
            User updatedUser = userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedUser.getId());
            response.put("fullName", updatedUser.getFullName());
            response.put("email", updatedUser.getEmail());
            response.put("phone", updatedUser.getPhone());
            response.put("role", updatedUser.getRole().toString());
            
            System.out.println("User updated successfully: " + response);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found with ID: " + userId);
                return ResponseEntity.status(404).body(error);
            }
            
            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("fullName", user.getFullName());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhone());
            response.put("role", user.getRole().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}