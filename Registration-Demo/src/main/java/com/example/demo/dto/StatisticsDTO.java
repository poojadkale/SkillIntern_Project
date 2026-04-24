package com.example.demo.dto;

public class StatisticsDTO {
    private long totalUsers;
    private long totalCompanies;
    private long totalStudents;
    private long totalInternships;
    private long totalApplications;
    private long pendingApplications;
    private long approvedApplications;
    private long rejectedApplications;
    
    // ❌ Remove these if they exist
    // private long pendingCompanies;
    // private long pendingStudents;
    // private long pendingApprovals;
    
    // Constructors
    public StatisticsDTO() {}
    
    public StatisticsDTO(long totalUsers, long totalCompanies, long totalStudents, 
                        long totalInternships, long totalApplications) {
        this.totalUsers = totalUsers;
        this.totalCompanies = totalCompanies;
        this.totalStudents = totalStudents;
        this.totalInternships = totalInternships;
        this.totalApplications = totalApplications;
    }
    
    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    
    public long getTotalCompanies() { return totalCompanies; }
    public void setTotalCompanies(long totalCompanies) { this.totalCompanies = totalCompanies; }
    
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    
    public long getTotalInternships() { return totalInternships; }
    public void setTotalInternships(long totalInternships) { this.totalInternships = totalInternships; }
    
    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }
    
    public long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }
    
    public long getApprovedApplications() { return approvedApplications; }
    public void setApprovedApplications(long approvedApplications) { this.approvedApplications = approvedApplications; }
    
    public long getRejectedApplications() { return rejectedApplications; }
    public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }
}