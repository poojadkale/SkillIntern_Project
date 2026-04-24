package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request.getEmail(), request.getPassword());
            System.out.println("=== Login Response being sent to frontend ===");
            System.out.println("userId: " + response.getUserId());
            System.out.println("email: " + response.getEmail());
            System.out.println("fullName: " + response.getFullName());
            System.out.println("role: " + response.getRole());
            System.out.println("phone: " + response.getPhone());
            System.out.println("=============================================");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            LoginResponse response = authService.register(request);
            System.out.println("=== Registration Response ===");
            System.out.println("userId: " + response.getUserId());
            System.out.println("email: " + response.getEmail());
            System.out.println("fullName: " + response.getFullName());
            System.out.println("role: " + response.getRole());
            System.out.println("phone: " + response.getPhone());
            System.out.println("=============================");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}