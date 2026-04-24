package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.NotificationService;
import com.example.demo.util.FileUploadUtil;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private StudentRepository studentRepo;
    
    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private ApplicationRepository applicationRepo;
    
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getStudentProfile(@PathVariable Long userId) {
        try {
            Student student = studentRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
            
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", student.getId());
            profileData.put("collegeName", student.getCollegeName());
            profileData.put("course", student.getCourse());
            profileData.put("branch", student.getBranch());
            profileData.put("yearOfStudy", student.getYearOfStudy());
            profileData.put("cgpa", student.getCgpa());
            profileData.put("skills", student.getSkills());
            profileData.put("collegeIdNumber", student.getCollegeIdNumber());
            profileData.put("resumeFilename", student.getResumeFilename());
            profileData.put("resumePath", student.getResumePath());
            profileData.put("fullName", user.getFullName());
            profileData.put("email", user.getEmail());
            profileData.put("phone", user.getPhone());
            
            return ResponseEntity.ok(profileData);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // GET applications for a student
    @GetMapping("/{userId}/applications")
    public ResponseEntity<?> getStudentApplications(@PathVariable Long userId) {
        try {
            System.out.println("=== Getting applications for userId: " + userId);
            
            Student student = studentRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));
            
            System.out.println("Found student with ID: " + student.getId());
            
            List<Application> applications = applicationRepo.findByStudent(student);
            
            System.out.println("Found " + applications.size() + " applications");
            
            List<Map<String, Object>> response = applications.stream()
                .map(app -> {
                    Map<String, Object> appMap = new HashMap<>();
                    appMap.put("id", app.getId());
                    appMap.put("internshipId", app.getInternship().getId());
                    appMap.put("internshipTitle", app.getInternship().getTitle());
                    appMap.put("companyName", app.getInternship().getCompany().getCompanyName());
                    appMap.put("companyId", app.getInternship().getCompany().getId());
                    appMap.put("status", app.getStatus().toString());
                    appMap.put("appliedAt", app.getAppliedAt().toString());
                    appMap.put("coverLetter", app.getCoverLetter());
                    return appMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("Error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping(value = "/profile/{userId}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateStudentProfile(
            @PathVariable Long userId,
            @RequestPart("profile") Student profileData,
            @RequestPart(value = "resume", required = false) MultipartFile resume) {
        try {
            boolean isNewProfile = false;
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Student student = studentRepo.findByUser(user).orElse(null);
            
            if (student == null) {
                isNewProfile = true;
                student = new Student();
                student.setUser(user);
            }
            
            student.setUser(user);
            student.setCollegeName(profileData.getCollegeName());
            student.setCourse(profileData.getCourse());
            student.setBranch(profileData.getBranch());
            student.setYearOfStudy(profileData.getYearOfStudy());
            student.setCgpa(profileData.getCgpa());
            student.setSkills(profileData.getSkills());
            student.setCollegeIdNumber(profileData.getCollegeIdNumber());
            
            if (resume != null && !resume.isEmpty()) {
                if (student.getResumeFilename() != null) {
                    try {
                        FileUploadUtil.deleteFile(student.getResumeFilename());
                    } catch (Exception e) {
                        System.err.println("Error deleting old resume: " + e.getMessage());
                    }
                }
                
                String filename = FileUploadUtil.saveFile(resume, userId.toString());
                student.setResumeFilename(filename);
                student.setResumePath(FileUploadUtil.getFileUrl(filename));
            }
            
            Student updated = studentRepo.save(student);
            
            // ========== NOTIFICATIONS ==========
            if (isNewProfile) {
                // Notify admins about new student profile
                notificationService.notifyAllAdmins(
                    "🎓 New Student Profile Created",
                    user.getFullName() + " has completed their student profile",
                    "STUDENT_NEW",
                    updated.getId().toString()
                );
                
                // Welcome notification to student
                notificationService.createNotification(
                    userId,
                    "Welcome to SkillIntern! 🎉",
                    "Your student profile has been created successfully. Start exploring internships now!",
                    "STUDENT_REGISTERED",
                    updated.getId().toString()
                );
            } else {
                // Notify student about profile update
                notificationService.createNotification(
                    userId,
                    "Profile Updated Successfully ✅",
                    "Your student profile has been updated successfully.",
                    "PROFILE_UPDATED",
                    updated.getId().toString()
                );
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", isNewProfile ? "Profile created successfully" : "Profile updated successfully");
            response.put("student", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Optional: Delete student profile endpoint
    @DeleteMapping("/profile/{userId}")
    public ResponseEntity<?> deleteStudentProfile(@PathVariable Long userId) {
        try {
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Student student = studentRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
            
            // Delete resume file if exists
            if (student.getResumeFilename() != null) {
                try {
                    FileUploadUtil.deleteFile(student.getResumeFilename());
                } catch (Exception e) {
                    System.err.println("Error deleting resume: " + e.getMessage());
                }
            }
            
            studentRepo.delete(student);
            
            // Notify admins about deletion
            notificationService.notifyAllAdmins(
                "🗑️ Student Profile Deleted",
                user.getFullName() + " has deleted their student profile",
                "STUDENT_DELETED",
                userId.toString()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Student profile deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}