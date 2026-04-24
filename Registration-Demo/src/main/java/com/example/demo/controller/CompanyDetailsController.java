package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Company;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.InternshipRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/companies")
public class CompanyDetailsController {

    @Autowired
    private CompanyRepository companyRepo;

    @Autowired
    private InternshipRepository internshipRepo;

    @GetMapping("/{companyId}")
    public ResponseEntity<?> getCompanyDetails(@PathVariable Long companyId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Company> companyOpt = companyRepo.findById(companyId);
            
            if (!companyOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Company not found with ID: " + companyId);
                return ResponseEntity.badRequest().body(response);
            }

            Company company = companyOpt.get();
            
            // Count internships for this company
            Long internshipCount = (long) internshipRepo.findByCompany(company).size();

            // Create response with existing fields
            Map<String, Object> companyData = new HashMap<>();
            companyData.put("id", company.getId());
            companyData.put("companyName", company.getCompanyName());
            companyData.put("website", company.getWebsite() != null ? company.getWebsite() : "www." + company.getCompanyName().toLowerCase() + ".com");
            companyData.put("location", company.getLocation() != null ? company.getLocation() : "Location not specified");
            companyData.put("description", company.getDescription() != null ? company.getDescription() : "No description available.");
            // Remove logo line since it doesn't exist
            // companyData.put("logo", company.getLogo() != null ? company.getLogo() : "");
            companyData.put("internshipCount", internshipCount);
            
            // Get contact info from associated user
            if (company.getUser() != null) {
                companyData.put("email", company.getUser().getEmail());
                companyData.put("contactPerson", company.getUser().getFullName());
                companyData.put("phone", company.getUser().getPhone() != null ? company.getUser().getPhone() : "+91 9876543210");
            } else {
                companyData.put("email", "contact@" + company.getCompanyName().toLowerCase() + ".com");
                companyData.put("contactPerson", "HR Team");
                companyData.put("phone", "+91 9876543210");
            }

            response.put("success", true);
            response.put("data", companyData);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}