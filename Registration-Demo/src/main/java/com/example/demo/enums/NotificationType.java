package com.example.demo.enums;

public enum NotificationType {
    // Contact related
    CONTACT_NEW("New Contact Message"),
    CONTACT_REPLY("Reply to Your Message"),
    CONTACT_CONFIRMATION("Message Sent"),
    
    // Internship related
    INTERNSHIP_NEW("New Internship Posted"),
    INTERNSHIP_NEW_STUDENT("New Opportunity"),
    INTERNSHIP_UPDATED("Internship Updated"),
    INTERNSHIP_DELETED("Internship Removed"),
    
    // Application related
    APPLICATION_NEW("New Application"),
    APPLICATION_SUBMITTED("Application Submitted"),
    APPLICATION_REVIEWED("Application Reviewed"),
    APPLICATION_SHORTLISTED("Shortlisted!"),
    APPLICATION_ACCEPTED("Application Accepted"),
    APPLICATION_REJECTED("Application Update"),
    
    // Profile related
    PROFILE_UPDATED("Profile Updated"),
    COMPANY_UPDATED("Company Updated"),
    STUDENT_NEW("New Student Registered"),
    STUDENT_DELETED("Student Deleted"),
    COMPANY_NEW("New Company Registered"),
    
    // System related
    SYSTEM_ALERT("System Alert"),
    REMINDER("Reminder");
    
    private final String displayName;
    
    NotificationType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}