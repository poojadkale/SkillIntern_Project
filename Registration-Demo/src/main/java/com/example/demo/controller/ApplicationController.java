package com.example.demo.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.demo.service.ApplicationService;
import com.example.demo.dto.ApplicationRequest;
import com.example.demo.dto.ApplicationResponse;
import com.example.demo.dto.ApplicationReviewRequest;
import com.example.demo.entity.User;
import com.example.demo.entity.Student;
import com.example.demo.entity.Company;
import com.example.demo.entity.Application;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.ApplicationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private StudentRepository studentRepo;  
    
    @Autowired
    private CompanyRepository companyRepo;
    
    @Autowired
    private ApplicationRepository applicationRepo;
    
    // Configure upload directory path
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping(value = "/applications/apply/{internshipId}/{userId}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> applyForInternship(
            @PathVariable Long internshipId,
            @PathVariable Long userId,
            @RequestPart("application") @Valid ApplicationRequest request,
            @RequestPart(value = "resume", required = false) MultipartFile resume) {
        try {
            ApplicationResponse response = applicationService.applyForInternship(
                internshipId, userId, request, resume);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error uploading resume: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/applications/student/{userId}")
    public ResponseEntity<?> getStudentApplications(@PathVariable Long userId) {
        try {
            System.out.println("=== getStudentApplications called ===");
            System.out.println("userId: " + userId);
            
            List<ApplicationResponse> applications = applicationService.getStudentApplications(userId);
            System.out.println("Found " + applications.size() + " applications");
            
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            System.out.println("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/applications/internship/{internshipId}")
    public ResponseEntity<?> getInternshipApplications(@PathVariable Long internshipId) {
        try {
            List<ApplicationResponse> applications = applicationService.getInternshipApplications(internshipId);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/applications/company/{userId}")
    public ResponseEntity<?> getCompanyApplications(@PathVariable Long userId) {
        try {
            List<ApplicationResponse> applications = applicationService.getCompanyApplications(userId);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long applicationId) {
        try {
            ApplicationResponse application = applicationService.getApplicationById(applicationId);
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/applications/{applicationId}/review")
    public ResponseEntity<?> reviewApplication(
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationReviewRequest reviewRequest) {
        try {
            System.out.println("=== reviewApplication endpoint called ===");
            System.out.println("Application ID: " + applicationId);
            System.out.println("Review Request object: " + reviewRequest);
            
            // Check if request body is null
            if (reviewRequest == null) {
                System.err.println("ERROR: Review request body is null");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Request body is missing");
                return ResponseEntity.badRequest().body(error);
            }
            
            System.out.println("Status from request: " + reviewRequest.getStatus());
            System.out.println("Comments from request: " + reviewRequest.getReviewComments());
            
            ApplicationResponse response = applicationService.reviewApplication(applicationId, reviewRequest);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("RuntimeException: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Exception: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error reviewing application: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // NEW: Download resume endpoint
    @GetMapping("/download/{filename}")
    public ResponseEntity<?> downloadResume(@PathVariable String filename) {
        try {
            System.out.println("=== Download resume called ===");
            System.out.println("Filename: " + filename);
            
            // Try multiple possible locations
            String[] possiblePaths = {
                uploadDir + "/" + filename,
                "./uploads/" + filename,
                "uploads/" + filename,
                "/var/uploads/" + filename
            };
            
            Resource resource = null;
            Path filePath = null;
            
            for (String path : possiblePaths) {
                try {
                    Path tryPath = Paths.get(path);
                    System.out.println("Trying path: " + tryPath.toAbsolutePath());
                    
                    if (tryPath.toFile().exists()) {
                        filePath = tryPath;
                        resource = new UrlResource(filePath.toUri());
                        System.out.println("Found file at: " + filePath.toAbsolutePath());
                        break;
                    }
                } catch (Exception e) {
                    System.out.println("Failed at path: " + path);
                }
            }
            
            if (resource != null && resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                System.out.println("File not found: " + filename);
                Map<String, String> error = new HashMap<>();
                error.put("message", "Resume file not found: " + filename);
                return ResponseEntity.status(404).body(error);
            }
            
        } catch (Exception e) {
            System.err.println("Error downloading resume: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error downloading resume: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Helper endpoint to list uploaded files (for debugging)
    @GetMapping("/download/list")
    public ResponseEntity<?> listUploadedFiles() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            List<String> files = java.nio.file.Files.list(uploadPath)
                    .map(path -> path.getFileName().toString())
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("uploadDir", uploadPath.toAbsolutePath().toString());
            response.put("files", files);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/applications/company/test/{userId}")
    public ResponseEntity<?> testCompany(@PathVariable Long userId) {
        try {
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Optional<Company> company = companyRepo.findByUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("userFound", user != null);
            response.put("userRole", user.getRole());
            response.put("companyExists", company.isPresent());
            if (company.isPresent()) {
                response.put("companyId", company.get().getId());
                response.put("companyName", company.get().getCompanyName());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/applications/debug/student/{userId}")
    public ResponseEntity<?> debugStudentData(@PathVariable Long userId) {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            System.out.println("=== Debug endpoint called for userId: " + userId);
            
            // Check user
            Optional<User> userOpt = userRepo.findById(userId);
            debug.put("userExists", userOpt.isPresent());
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                debug.put("userEmail", user.getEmail());
                debug.put("userRole", user.getRole().toString());
                
                // Check student profile
                Optional<Student> studentOpt = studentRepo.findByUser(user);
                debug.put("studentProfileExists", studentOpt.isPresent());
                
                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    debug.put("studentId", student.getId());
                    debug.put("collegeName", student.getCollegeName());
                    debug.put("course", student.getCourse());
                    debug.put("branch", student.getBranch());
                    debug.put("yearOfStudy", student.getYearOfStudy());
                    debug.put("cgpa", student.getCgpa());
                    
                    // Count applications
                    List<Application> applications = applicationRepo.findByStudent(student);
                    debug.put("applicationsCount", applications.size());
                    
                    List<Map<String, Object>> appList = applications.stream()
                        .map(app -> {
                            Map<String, Object> appMap = new HashMap<>();
                            appMap.put("id", app.getId());
                            appMap.put("internshipTitle", app.getInternship().getTitle());
                            appMap.put("status", app.getStatus().toString());
                            appMap.put("appliedAt", app.getAppliedAt().toString());
                            return appMap;
                        })
                        .collect(Collectors.toList());
                    debug.put("applications", appList);
                } else {
                    debug.put("message", "Student profile not found. Please complete your profile.");
                    debug.put("suggestion", "Create student profile for user ID: " + userId);
                }
            } else {
                debug.put("message", "User not found with ID: " + userId);
            }
            
            return ResponseEntity.ok(debug);
            
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(debug);
        }
    }
}