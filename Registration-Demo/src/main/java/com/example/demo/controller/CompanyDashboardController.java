package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.*;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ApplicationRepository;
import com.example.demo.service.InternshipService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/internships")
public class CompanyDashboardController {

    @Autowired
    private InternshipService internshipService;

    @Autowired
    private CompanyRepository companyRepo;
    
    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private ApplicationRepository applicationRepo;

    @PostMapping("/company/{userId}/add")
    public ResponseEntity<?> addInternship(
            @PathVariable Long userId,
            @RequestBody Internship internship) {
        try {
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Company company = companyRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company profile not found"));

            internship.setCompany(company);
            Internship saved = internshipService.addInternship(internship);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/company/{userId}/list")
    public ResponseEntity<?> getInternships(@PathVariable Long userId) {
        try {
            System.out.println("=== Getting internships for user ID: " + userId);
            
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Company company = companyRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company profile not found"));

            List<Internship> internships = internshipService.getByCompany(company);
            System.out.println("Found " + internships.size() + " internships");
            return ResponseEntity.ok(internships);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInternship(
            @PathVariable Long id,
            @RequestBody Internship updated) {
        try {
            Internship internship = internshipService.updateInternship(id, updated);
            return ResponseEntity.ok(internship);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInternship(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        try {
            Internship internship = internshipService.getById(id);
            
            if (internship == null) {
                response.put("message", "Internship not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            List<Application> applications = applicationRepo.findByInternship(internship);
            
            if (!applications.isEmpty()) {
                boolean hasPendingOrReviewed = applications.stream()
                    .anyMatch(app -> app.getStatus() == Application.ApplicationStatus.PENDING 
                        || app.getStatus() == Application.ApplicationStatus.REVIEWED);
                
                if (hasPendingOrReviewed) {
                    response.put("message", "Cannot delete internship with pending or reviewed applications");
                    return ResponseEntity.badRequest().body(response);
                }
                
                applicationRepo.deleteAll(applications);
            }
            
            boolean deleted = internshipService.deleteInternship(id);
            
            if (deleted) {
                response.put("message", "Internship and associated applications deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Internship not found");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/all/open")
    public ResponseEntity<?> getAllOpenInternships() {
        try {
            List<Internship> internships = internshipService.getAllOpenInternships();
            return ResponseEntity.ok(internships);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ADD THIS NEW ENDPOINT - Get applications for a company
    @GetMapping("/company/{userId}/applications")
    public ResponseEntity<?> getCompanyApplications(@PathVariable Long userId) {
        try {
            System.out.println("=== Getting applications for user ID: " + userId);
            
            // Find the user
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            // Find the company associated with this user
            Company company = companyRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Company profile not found for user: " + user.getEmail()));
            
            System.out.println("Company found: " + company.getCompanyName());
            
            // Get all applications for this company's internships
            List<Application> applications = applicationRepo.findByInternship_Company(company);
            
            System.out.println("Found " + applications.size() + " applications");
            
            // Convert to response format
            List<Map<String, Object>> response = applications.stream()
                .map(app -> {
                    Map<String, Object> appData = new HashMap<>();
                    appData.put("id", app.getId());
                    appData.put("internshipId", app.getInternship().getId());
                    appData.put("internshipTitle", app.getInternship().getTitle());
                    appData.put("studentId", app.getStudent().getId());
                    appData.put("studentName", app.getStudent().getUser().getFullName());
                    appData.put("studentEmail", app.getStudent().getUser().getEmail());
                    appData.put("studentPhone", app.getStudent().getUser().getPhone());
                    appData.put("collegeName", app.getCollegeName());
                    appData.put("course", app.getCourse());
                    appData.put("branch", app.getBranch());
                    appData.put("yearOfStudy", app.getYearOfStudy());
                    appData.put("cgpa", app.getCgpa());
                    appData.put("skills", app.getSkills());
                    appData.put("coverLetter", app.getCoverLetter());
                    appData.put("whyHireYou", app.getWhyHireYou());
                    appData.put("projects", app.getProjects());
                    appData.put("achievements", app.getAchievements());
                    appData.put("status", app.getStatus().toString());
                    appData.put("appliedAt", app.getAppliedAt());
                    appData.put("reviewComments", app.getReviewComments());
                    appData.put("resumeFilename", app.getResumeFilename());
                    appData.put("resumePath", app.getResumePath());
                    return appData;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("Error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching applications: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}