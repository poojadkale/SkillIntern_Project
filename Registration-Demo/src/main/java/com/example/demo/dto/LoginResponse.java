package com.example.demo.dto;

import com.example.demo.enums.Role;

public class LoginResponse {
    private Long userId;
    private String email;
    private String fullName;
    private String phone; 
    private Role role;
    private String message;
    
    public LoginResponse() {}
    
    // Constructor with all fields including phone
    public LoginResponse(Long userId, String email, String fullName, Role role, String phone) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.phone = phone;
    }
    
    // Constructor without phone (for backward compatibility)
    public LoginResponse(Long userId, String email, String fullName, Role role) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.phone = "";
    }
    
    // Getters and Setters
    public Long getUserId() { 
        return userId; 
    }
    
    public void setUserId(Long userId) { 
        this.userId = userId; 
    }
    
    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }
    
    public String getFullName() { 
        return fullName; 
    }
    
    public void setFullName(String fullName) { 
        this.fullName = fullName; 
    }
    
    public String getPhone() { 
        return phone; 
    }
    
    public void setPhone(String phone) { 
        this.phone = phone; 
    }
    
    public Role getRole() { 
        return role; 
    }
    
    public void setRole(Role role) { 
        this.role = role; 
    }
    
    public String getMessage() { 
        return message; 
    }
    
    public void setMessage(String message) { 
        this.message = message; 
    }
}