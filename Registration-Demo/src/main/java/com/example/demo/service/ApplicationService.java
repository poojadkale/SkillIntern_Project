package com.example.demo.service;
import com.example.demo.util.FileUploadUtil;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.entity.*;
import com.example.demo.dto.ApplicationRequest;
import com.example.demo.dto.ApplicationResponse;
import com.example.demo.dto.ApplicationReviewRequest;
import com.example.demo.repository.ApplicationRepository;
import com.example.demo.repository.InternshipRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepo;

    @Autowired
    private InternshipRepository internshipRepo;

    @Autowired
    private StudentRepository studentRepo;
    
    @Autowired
    private CompanyRepository companyRepo;
    
    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ApplicationResponse applyForInternship(Long internshipId, Long userId, 
                                                  ApplicationRequest request, 
                                                  MultipartFile resume) throws IOException {
        if (applicationRepo.existsByInternshipIdAndStudentId(internshipId, userId)) {
            throw new RuntimeException("You have already applied for this internship");
        }

        Internship internship = internshipRepo.findById(internshipId)
            .orElseThrow(() -> new RuntimeException("Internship not found"));

        Student student = studentRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        if (internship.getStatus() != Internship.Status.OPEN) {
            throw new RuntimeException("This internship is no longer accepting applications");
        }

        String resumeFilename = null;
        if (resume != null && !resume.isEmpty()) {
            resumeFilename = FileUploadUtil.saveFile(resume, userId.toString());
        }

        Application application = new Application();
        application.setInternship(internship);
        application.setStudent(student);
        application.setFullName(request.getFullName());
        application.setEmail(request.getEmail());
        application.setPhone(request.getPhone());
        application.setCollegeName(request.getCollegeName());
        application.setCourse(request.getCourse());
        application.setBranch(request.getBranch());
        application.setYearOfStudy(request.getYearOfStudy());
        application.setCgpa(request.getCgpa());
        application.setSkills(request.getSkills());
        application.setCoverLetter(request.getCoverLetter());
        application.setWhyHireYou(request.getWhyHireYou());
        application.setProjects(request.getProjects());
        application.setAchievements(request.getAchievements());
        application.setResumeFilename(resumeFilename);
        application.setResumePath(FileUploadUtil.getFileUrl(resumeFilename));
        application.setStatus(Application.ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());

        Application saved = applicationRepo.save(application);
        
        // ========== NOTIFICATIONS ==========
        
        // Notify the company about new application
        Long companyUserId = internship.getCompany().getUser().getId();
        notificationService.notifyCompany(
            companyUserId,
            "📝 New Application Received",
            request.getFullName() + " applied for " + internship.getTitle(),
            "APPLICATION_NEW",
            saved.getId().toString()
        );
        
        // Notify the student that application was submitted
        notificationService.notifyStudent(
            userId,
            "✅ Application Submitted Successfully",
            "Your application for " + internship.getTitle() + " has been submitted successfully",
            "APPLICATION_SUBMITTED",
            saved.getId().toString()
        );
        
        // Notify all admins about new application
        notificationService.notifyAllAdmins(
            "📋 New Internship Application",
            request.getFullName() + " applied for " + internship.getTitle() + " at " + internship.getCompany().getCompanyName(),
            "APPLICATION_NEW_ADMIN",
            saved.getId().toString()
        );
        
        return new ApplicationResponse(saved);
    }
    
    public List<ApplicationResponse> getStudentApplications(Long userId) {
        Student student = studentRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));
        
        return applicationRepo.findByStudent(student).stream()
            .map(ApplicationResponse::new)
            .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getCompanyApplications(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        Company company = companyRepo.findByUser(user)
            .orElseThrow(() -> new RuntimeException(
                "Company profile not found for user: " + user.getEmail() + 
                ". Please complete your company profile first."
            ));
        
        return applicationRepo.findByInternship_Company(company).stream()
            .map(ApplicationResponse::new)
            .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getInternshipApplications(Long internshipId) {
        Internship internship = internshipRepo.findById(internshipId)
            .orElseThrow(() -> new RuntimeException("Internship not found"));
        
        return applicationRepo.findByInternship(internship).stream()
            .map(ApplicationResponse::new)
            .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse reviewApplication(Long applicationId, ApplicationReviewRequest reviewRequest) {
        try {
            System.out.println("=== reviewApplication service called ===");
            System.out.println("Application ID: " + applicationId);
            
            if (reviewRequest == null) {
                throw new RuntimeException("Review request is null. Please provide status and comments.");
            }
            
            String statusStr = reviewRequest.getStatus();
            System.out.println("Raw status string: " + statusStr);
            
            if (statusStr == null || statusStr.trim().isEmpty()) {
                throw new RuntimeException("Status is required. Please select a decision (Shortlist, Accept, or Reject)");
            }
            
            Application application = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));
            
            System.out.println("Current application status: " + application.getStatus());
            
            String upperStatus = statusStr.trim().toUpperCase();
            System.out.println("Uppercase status: " + upperStatus);
            
            Application.ApplicationStatus newStatus;
            String notificationTitle = "";
            String notificationMessage = "";
            
            switch (upperStatus) {
                case "PENDING":
                    newStatus = Application.ApplicationStatus.PENDING;
                    notificationTitle = "Application Received";
                    notificationMessage = "Your application has been received and is pending review.";
                    break;
                case "REVIEWED":
                    newStatus = Application.ApplicationStatus.REVIEWED;
                    notificationTitle = "Application Reviewed";
                    notificationMessage = "Your application has been reviewed by the company.";
                    break;
                case "SHORTLISTED":
                    newStatus = Application.ApplicationStatus.SHORTLISTED;
                    notificationTitle = "🎉 Congratulations! You've been Shortlisted!";
                    notificationMessage = "You have been shortlisted for " + application.getInternship().getTitle() + 
                           " at " + application.getInternship().getCompany().getCompanyName();
                    break;
                case "ACCEPTED":
                    newStatus = Application.ApplicationStatus.ACCEPTED;
                    notificationTitle = "🎊 Offer Letter! Application Accepted!";
                    notificationMessage = "Congratulations! Your application for " + application.getInternship().getTitle() + 
                           " has been accepted by " + application.getInternship().getCompany().getCompanyName();
                    break;
                case "REJECTED":
                    newStatus = Application.ApplicationStatus.REJECTED;
                    notificationTitle = "Application Update";
                    notificationMessage = "Your application for " + application.getInternship().getTitle() + 
                           " at " + application.getInternship().getCompany().getCompanyName() + " has been reviewed.";
                    break;
                default:
                    newStatus = Application.ApplicationStatus.PENDING;
                    notificationTitle = "Application Update";
                    notificationMessage = "Your application status has been updated.";
                    break;
            }
            
            application.setStatus(newStatus);
            
            String comments = reviewRequest.getReviewComments();
            if (comments != null && !comments.trim().isEmpty()) {
                application.setReviewComments(comments);
                notificationMessage += "\n\nComments: " + comments;
            }
            
            application.setReviewedAt(LocalDateTime.now());
            
            Application updated = applicationRepo.save(application);
            System.out.println("✅ Application updated successfully. New status: " + updated.getStatus());
            
            // ========== NOTIFICATION FOR STUDENT ==========
            Long studentUserId = application.getStudent().getUser().getId();
            notificationService.notifyStudent(
                studentUserId,
                notificationTitle,
                notificationMessage,
                "APPLICATION_REVIEWED",
                applicationId.toString()
            );
            
            // Notify admins about application review
            notificationService.notifyAllAdmins(
                "📋 Application Reviewed",
                "Application for " + application.getInternship().getTitle() + " was marked as " + newStatus,
                "APPLICATION_REVIEWED_ADMIN",
                applicationId.toString()
            );
            
            return new ApplicationResponse(updated);
            
        } catch (Exception e) {
            System.err.println("❌ Error in reviewApplication: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to review application: " + e.getMessage());
        }
    }
    
    public ApplicationResponse getApplicationById(Long applicationId) {
        Application application = applicationRepo.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));
        return new ApplicationResponse(application);
    }
}