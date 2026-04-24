package com.example.demo.dto;

public class CompanyDetailsDTO {
    private Long id;
    private String companyName;
    private String website;
    private String location;
    private String description;
    private String email;
    private String phone;
    private String logo;
    private String founded;
    private String employees;
    private String industry;
    private Long internshipCount;

    // Constructors
    public CompanyDetailsDTO() {}

    public CompanyDetailsDTO(Long id, String companyName, String website, String location, 
                            String description, String email, String phone, String logo,
                            String founded, String employees, String industry, Long internshipCount) {
        this.id = id;
        this.companyName = companyName;
        this.website = website;
        this.location = location;
        this.description = description;
        this.email = email;
        this.phone = phone;
        this.logo = logo;
        this.founded = founded;
        this.employees = employees;
        this.industry = industry;
        this.internshipCount = internshipCount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getFounded() { return founded; }
    public void setFounded(String founded) { this.founded = founded; }

    public String getEmployees() { return employees; }
    public void setEmployees(String employees) { this.employees = employees; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public Long getInternshipCount() { return internshipCount; }
    public void setInternshipCount(Long internshipCount) { this.internshipCount = internshipCount; }
}