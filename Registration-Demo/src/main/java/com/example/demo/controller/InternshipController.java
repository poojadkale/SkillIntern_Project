// com.example.demo.controller.InternshipController.java
package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Internship;
import com.example.demo.entity.Company;
import com.example.demo.repository.InternshipRepository;
import com.example.demo.repository.CompanyRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/internships")
public class InternshipController {

    @Autowired
    private InternshipRepository internshipRepository;
    
    @Autowired
    private CompanyRepository companyRepository;

    // Get internships by company ID - This is the only endpoint for this
    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getInternshipsByCompanyId(@PathVariable Long companyId) {
        try {
            Optional<Company> companyOpt = companyRepository.findById(companyId);
            
            if (!companyOpt.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Company not found with ID: " + companyId));
            }
            
            Company company = companyOpt.get();
            List<Internship> internships = internshipRepository.findByCompany(company);
            
            // Filter only OPEN internships
            List<Internship> openInternships = internships.stream()
                .filter(i -> i.getStatus() == Internship.Status.OPEN)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(openInternships);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Get all open internships
    @GetMapping("/open")
    public ResponseEntity<List<Internship>> getAllOpenInternships() {
        List<Internship> openInternships = internshipRepository.findByStatus(Internship.Status.OPEN);
        return ResponseEntity.ok(openInternships);
    }
}