// com.example.demo.dto.CompanyDTO.java
package com.example.demo.dto;

public class CompanyDTO {
    private Long id;
    private String companyName;
    private String location;
    private String industry;
    private String description;
    private String website;
    private String approvalStatus;
    private Integer internshipCount;
    
    // Default constructor
    public CompanyDTO() {}
    
    // Constructor with fields
    public CompanyDTO(Long id, String companyName, String location, String description, String website, String approvalStatus) {
        this.id = id;
        this.companyName = companyName;
        this.location = location;
        this.description = description;
        this.website = website;
        this.approvalStatus = approvalStatus;
        this.internshipCount = 0;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    
    public Integer getInternshipCount() { return internshipCount; }
    public void setInternshipCount(Integer internshipCount) { this.internshipCount = internshipCount; }
}