package com.example.demo.dto;

import com.example.demo.entity.Application;
import java.time.LocalDateTime;

public class ApplicationResponse {
    private Long id;
    private Long internshipId;
    private String internshipTitle;
    private String internshipLocation;
    private Double stipend;
    private String duration;
    private String type;
    private String requiredSkills;
    private String companyName;
    private Long studentId;
    private String studentName;
    private String fullName;
    private String email;
    private String phone;
    private String collegeName;
    private String course;
    private String branch;
    private Integer yearOfStudy;
    private Double cgpa;
    private String skills;
    private String coverLetter;
    private String whyHireYou;
    private String projects;
    private String achievements;
    private String resumePath;
    private String resumeFilename;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private String reviewComments;

    public ApplicationResponse(Application application) {
        try {
            System.out.println("Creating ApplicationResponse for application ID: " + application.getId());
            
            this.id = application.getId();
            
            // Internship details with safe handling
            if (application.getInternship() != null) {
                System.out.println("Internship found, ID: " + application.getInternship().getId());
                
                this.internshipId = application.getInternship().getId();
                this.internshipTitle = application.getInternship().getTitle() != null ? 
                    application.getInternship().getTitle() : "Not Specified";
                this.internshipLocation = application.getInternship().getLocation() != null ? 
                    application.getInternship().getLocation() : "Remote";
                
                // Handle stipend - convert double to Double safely
                double stipendValue = application.getInternship().getStipend();
                this.stipend = stipendValue;
                
                this.duration = application.getInternship().getDuration() != null ? 
                    application.getInternship().getDuration() : "Not Specified";
                this.type = application.getInternship().getType() != null ? 
                    application.getInternship().getType() : "Not Specified";
                this.requiredSkills = application.getInternship().getRequiredSkills() != null ? 
                    application.getInternship().getRequiredSkills() : "";
                
                if (application.getInternship().getCompany() != null) {
                    this.companyName = application.getInternship().getCompany().getCompanyName() != null ? 
                        application.getInternship().getCompany().getCompanyName() : "Unknown Company";
                } else {
                    this.companyName = "Unknown Company";
                }
            } else {
                System.out.println("No internship found for application");
                this.internshipId = 0L;
                this.internshipTitle = "Not Specified";
                this.internshipLocation = "Remote";
                this.stipend = 0.0;
                this.duration = "Not Specified";
                this.type = "Not Specified";
                this.requiredSkills = "";
                this.companyName = "Unknown Company";
            }
            
            // Student details with safe handling
            if (application.getStudent() != null) {
                System.out.println("Student found, ID: " + application.getStudent().getId());
                
                this.studentId = application.getStudent().getId();
                if (application.getStudent().getUser() != null) {
                    this.studentName = application.getStudent().getUser().getFullName() != null ? 
                        application.getStudent().getUser().getFullName() : "Unknown";
                } else {
                    this.studentName = "Unknown";
                }
            } else {
                System.out.println("No student found for application");
                this.studentId = 0L;
                this.studentName = "Unknown";
            }
            
            // Application form data with null safety
            this.fullName = application.getFullName() != null ? application.getFullName() : "";
            this.email = application.getEmail() != null ? application.getEmail() : "";
            this.phone = application.getPhone() != null ? application.getPhone() : "";
            this.collegeName = application.getCollegeName() != null ? application.getCollegeName() : "";
            this.course = application.getCourse() != null ? application.getCourse() : "";
            this.branch = application.getBranch() != null ? application.getBranch() : "";
            this.yearOfStudy = application.getYearOfStudy() != null ? application.getYearOfStudy() : 0;
            this.cgpa = application.getCgpa() != null ? application.getCgpa() : 0.0;
            this.skills = application.getSkills() != null ? application.getSkills() : "";
            this.coverLetter = application.getCoverLetter() != null ? application.getCoverLetter() : "";
            this.whyHireYou = application.getWhyHireYou() != null ? application.getWhyHireYou() : "";
            this.projects = application.getProjects() != null ? application.getProjects() : "";
            this.achievements = application.getAchievements() != null ? application.getAchievements() : "";
            this.resumePath = application.getResumePath() != null ? application.getResumePath() : "";
            this.resumeFilename = application.getResumeFilename() != null ? application.getResumeFilename() : "";
            
            // Status with null check
            this.status = application.getStatus() != null ? application.getStatus().toString() : "PENDING";
            
            // Dates
            this.appliedAt = application.getAppliedAt();
            this.reviewedAt = application.getReviewedAt();
            this.reviewComments = application.getReviewComments() != null ? application.getReviewComments() : "";
            
            System.out.println("ApplicationResponse created successfully");
        } catch (Exception e) {
            System.err.println("Error creating ApplicationResponse: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create ApplicationResponse: " + e.getMessage());
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInternshipId() { return internshipId; }
    public void setInternshipId(Long internshipId) { this.internshipId = internshipId; }

    public String getInternshipTitle() { return internshipTitle; }
    public void setInternshipTitle(String internshipTitle) { this.internshipTitle = internshipTitle; }

    public String getInternshipLocation() { return internshipLocation; }
    public void setInternshipLocation(String internshipLocation) { this.internshipLocation = internshipLocation; }

    public Double getStipend() { return stipend; }
    public void setStipend(Double stipend) { this.stipend = stipend; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public Integer getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(Integer yearOfStudy) { this.yearOfStudy = yearOfStudy; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getWhyHireYou() { return whyHireYou; }
    public void setWhyHireYou(String whyHireYou) { this.whyHireYou = whyHireYou; }

    public String getProjects() { return projects; }
    public void setProjects(String projects) { this.projects = projects; }

    public String getAchievements() { return achievements; }
    public void setAchievements(String achievements) { this.achievements = achievements; }

    public String getResumePath() { return resumePath; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }

    public String getResumeFilename() { return resumeFilename; }
    public void setResumeFilename(String resumeFilename) { this.resumeFilename = resumeFilename; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewComments() { return reviewComments; }
    public void setReviewComments(String reviewComments) { this.reviewComments = reviewComments; }
}