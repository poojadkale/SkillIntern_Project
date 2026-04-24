package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminReplyDTO {
    
    @NotBlank(message = "Response is required")
    private String response;
    
    private String status;
    
    // Add these fields
    private String adminName;
    private String adminEmail;
    
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }
    
    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
}