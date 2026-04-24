package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ApplicationReviewRequest {
    private String status;
    private String reviewComments;
    
    // Default constructor (required for Jackson deserialization)
    public ApplicationReviewRequest() {
    }
    
    // Constructor with fields
    @JsonCreator
    public ApplicationReviewRequest(
            @JsonProperty("status") String status,
            @JsonProperty("reviewComments") String reviewComments) {
        this.status = status;
        this.reviewComments = reviewComments;
    }
    
    // Getters and setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getReviewComments() { return reviewComments; }
    public void setReviewComments(String reviewComments) { this.reviewComments = reviewComments; }
}