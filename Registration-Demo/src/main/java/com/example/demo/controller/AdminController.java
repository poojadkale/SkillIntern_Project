package com.example.demo.controller;

import com.example.demo.dto.AdminResponseDTO;
import com.example.demo.dto.StatisticsDTO;
import com.example.demo.entity.*;
import com.example.demo.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Dashboard Statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatisticsDTO> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }

    // User Management
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ==================== COMPANY MANAGEMENT ====================
    
    @GetMapping("/companies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllCompanies() {
        return ResponseEntity.ok(adminService.getAllCompaniesWithDetails());
    }

    @GetMapping("/companies/{companyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCompanyDetails(@PathVariable Long companyId) {
        return ResponseEntity.ok(adminService.getCompanyCompleteDetails(companyId));
    }

    @DeleteMapping("/companies/{companyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCompany(@PathVariable Long companyId) {
        adminService.deleteCompany(companyId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Company deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ==================== STUDENT MANAGEMENT ====================
    
    // Get all students (basic info - for backward compatibility)
    @GetMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    // NEW: Get all students with complete details (including applications, statistics)
    @GetMapping("/students/details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllStudentsWithDetails() {
        return ResponseEntity.ok(adminService.getAllStudentsWithDetails());
    }

    // Get single student basic details
    @GetMapping("/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> getStudentDetails(@PathVariable Long studentId) {
        return ResponseEntity.ok(adminService.getStudentDetails(studentId));
    }

    // NEW: Get single student complete details (including applications, statistics)
    @GetMapping("/students/{studentId}/details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStudentCompleteDetails(@PathVariable Long studentId) {
        return ResponseEntity.ok(adminService.getStudentCompleteDetails(studentId));
    }

    @DeleteMapping("/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId) {
        adminService.deleteStudent(studentId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Student deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ==================== INTERNSHIP MANAGEMENT ====================
    
    @GetMapping("/internships")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Internship>> getAllInternships() {
        return ResponseEntity.ok(adminService.getAllInternships());
    }

    @DeleteMapping("/internships/{internshipId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteInternship(@PathVariable Long internshipId) {
        adminService.deleteInternship(internshipId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Internship deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ==================== APPLICATION MANAGEMENT ====================
    
    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(adminService.getAllApplications());
    }

    @GetMapping("/applications/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Application>> getApplicationsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(adminService.getApplicationsByStatus(status));
    }

    @PutMapping("/applications/{applicationId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long applicationId, 
            @RequestParam String status) {
        adminService.updateApplicationStatus(applicationId, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Application status updated successfully");
        return ResponseEntity.ok(response);
    }
}