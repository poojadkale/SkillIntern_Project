package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/home")
public class HomeController {

    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private InternshipRepository internshipRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Get top companies for homepage
    @GetMapping("/companies")
    public ResponseEntity<?> getTopCompanies() {
        try {
            List<Company> companies = companyRepository.findAll();
            
            // Limit to first 8 companies
            List<Map<String, Object>> response = companies.stream().limit(8).map(company -> {
                Map<String, Object> companyData = new HashMap<>();
                companyData.put("id", company.getId());
                companyData.put("companyName", company.getCompanyName());
                companyData.put("location", company.getLocation());
                companyData.put("website", company.getWebsite());
                return companyData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get featured internships for homepage
    @GetMapping("/internships/featured")
    public ResponseEntity<?> getFeaturedInternships() {
        try {
            // Get internships that are OPEN and limit to first 6
            List<Internship> internships = internshipRepository.findAll().stream()
                .filter(i -> i.getStatus() == Internship.Status.OPEN)
                .limit(6)
                .collect(Collectors.toList());
            
            List<Map<String, Object>> response = internships.stream().map(internship -> {
                Map<String, Object> internshipData = new HashMap<>();
                internshipData.put("id", internship.getId());
                internshipData.put("title", internship.getTitle());
                internshipData.put("description", internship.getDescription());
                internshipData.put("location", internship.getLocation());
                internshipData.put("duration", internship.getDuration());
                internshipData.put("stipend", internship.getStipend());
                internshipData.put("requiredSkills", internship.getRequiredSkills());
                internshipData.put("companyName", internship.getCompany().getCompanyName());
                internshipData.put("companyId", internship.getCompany().getId());
                return internshipData;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get statistics for homepage (from /home/stats)
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("internships", internshipRepository.count());
            stats.put("companies", companyRepository.count());
            stats.put("students", studentRepository.count());
            stats.put("activeStudents", studentRepository.count());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}