package com.example.demo.dto;

public class CompanyHomeDTO {
    private Long id;
    private String companyName;
    private String logo;
    private Long internshipCount;

    public CompanyHomeDTO(Long id, String companyName, String logo, Long internshipCount) {
        this.id = id;
        this.companyName = companyName;
        this.logo = logo;
        this.internshipCount = internshipCount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public Long getInternshipCount() { return internshipCount; }
    public void setInternshipCount(Long internshipCount) { this.internshipCount = internshipCount; }
}