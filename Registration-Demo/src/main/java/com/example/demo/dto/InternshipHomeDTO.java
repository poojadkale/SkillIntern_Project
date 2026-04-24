package com.example.demo.dto;

public class InternshipHomeDTO {
    private Long id;
    private String title;
    private String companyName;
    private String location;
    private String type;
    private String stipend;
    private String duration;
    private String requiredSkills;

    public InternshipHomeDTO(Long id, String title, String companyName, String location, 
                             String type, String stipend, String duration, String requiredSkills) {
        this.id = id;
        this.title = title;
        this.companyName = companyName;
        this.location = location;
        this.type = type;
        this.stipend = stipend;
        this.duration = duration;
        this.requiredSkills = requiredSkills;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStipend() { return stipend; }
    public void setStipend(String stipend) { this.stipend = stipend; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
}