package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.dto.CompanyDTO;
import com.example.demo.entity.Company;
import com.example.demo.entity.User;
import com.example.demo.entity.Internship;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.InternshipRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepo;
    
    @Autowired
    private InternshipRepository internshipRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Company createOrUpdateCompany(User user, Company companyData) {
        boolean isNew = false;
        Company company = companyRepo.findByUser(user)
            .orElse(new Company());
        
        if (company.getId() == null) {
            isNew = true;
        }
        
        company.setUser(user);
        company.setCompanyName(companyData.getCompanyName());
        company.setWebsite(companyData.getWebsite());
        company.setLocation(companyData.getLocation());
        company.setDescription(companyData.getDescription());
        
        if (isNew) {
            company.setApprovalStatus("PENDING");
        }

        Company saved = companyRepo.save(company);
        
        // ========== NOTIFICATIONS ==========
        if (isNew) {
            // Notify admins about new company registration
            notificationService.notifyAllAdmins(
                "🏢 New Company Registered",
                company.getCompanyName() + " has registered on the platform",
                "COMPANY_NEW",
                saved.getId().toString()
            );
            
            // Notify the company about successful registration
            notificationService.createNotification(
                user.getId(),
                "Welcome to SkillIntern! 🎉",
                "Your company '" + company.getCompanyName() + "' has been successfully registered. You can now start posting internships.",
                "COMPANY_REGISTERED",
                saved.getId().toString()
            );
        } else {
            // Notify admins about profile update
            notificationService.notifyAllAdmins(
                "✏️ Company Profile Updated",
                company.getCompanyName() + " has updated their company profile",
                "COMPANY_UPDATED",
                saved.getId().toString()
            );
            
            // Notify company about successful update
            notificationService.createNotification(
                user.getId(),
                "Profile Updated Successfully",
                "Your company profile has been updated successfully.",
                "PROFILE_UPDATED",
                saved.getId().toString()
            );
        }
        
        return saved;
    }

    public Company getByUser(User user) {
        return companyRepo.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Company profile not found"));
    }
    
    public List<CompanyDTO> getApprovedCompanies() {
        List<Company> approvedCompanies = companyRepo.findByApprovalStatus("APPROVED");
        System.out.println("📊 Found " + approvedCompanies.size() + " approved companies in database");
        
        return approvedCompanies.stream().map(company -> {
            CompanyDTO dto = new CompanyDTO();
            dto.setId(company.getId());
            dto.setCompanyName(company.getCompanyName());
            dto.setLocation(company.getLocation());
            dto.setDescription(company.getDescription());
            dto.setWebsite(company.getWebsite());
            dto.setApprovalStatus(company.getApprovalStatus());
            
            try {
                List<Internship> internships = internshipRepository.findByCompany(company);
                long openInternships = internships.stream()
                    .filter(i -> i.getStatus() == Internship.Status.OPEN)
                    .count();
                dto.setInternshipCount((int) openInternships);
                System.out.println("  - " + company.getCompanyName() + ": " + openInternships + " open internships");
            } catch (Exception e) {
                dto.setInternshipCount(0);
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
}