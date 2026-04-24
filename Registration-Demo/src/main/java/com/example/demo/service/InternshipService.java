package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.entity.*;
import com.example.demo.repository.InternshipRepository;
import java.util.List;

@Service
public class InternshipService {

    @Autowired
    private InternshipRepository internshipRepo;
    
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Internship addInternship(Internship internship) {
        internship.setPostedAt(java.time.LocalDateTime.now());
        Internship saved = internshipRepo.save(internship);
        
        // ========== NOTIFICATIONS ==========
        
        // Notify all admins about new internship
        notificationService.notifyAllAdmins(
            "🏢 New Internship Posted",
            internship.getCompany().getCompanyName() + " posted a new internship: " + internship.getTitle(),
            "INTERNSHIP_NEW",
            saved.getId().toString()
        );
        
        // Notify all students about new opportunity
        notificationService.notifyAllStudents(
            "✨ New Internship Opportunity!",
            internship.getCompany().getCompanyName() + " is hiring for " + internship.getTitle() + 
            " (Stipend: ₹" + internship.getStipend() + "/month)",
            "INTERNSHIP_NEW_STUDENT",
            saved.getId().toString()
        );
        
        // Notify the company that posted successfully
        Long companyUserId = internship.getCompany().getUser().getId();
        notificationService.createNotification(
            companyUserId,
            "✅ Internship Posted Successfully",
            "Your internship '" + internship.getTitle() + "' has been posted successfully and is now visible to students.",
            "INTERNSHIP_POSTED",
            saved.getId().toString()
        );
        
        return saved;
    }

    public List<Internship> getByCompany(Company company) {
        return internshipRepo.findByCompany(company);
    }

    @Transactional
    public Internship updateInternship(Long id, Internship updated) {
        return internshipRepo.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setDescription(updated.getDescription());
            existing.setRequiredSkills(updated.getRequiredSkills());
            existing.setStipend(updated.getStipend());
            existing.setLocation(updated.getLocation());
            existing.setDuration(updated.getDuration());
            existing.setStatus(updated.getStatus());
            existing.setType(updated.getType());
            existing.setEndDate(updated.getEndDate());
            existing.setNumberOfOpenings(updated.getNumberOfOpenings());
            
            Internship saved = internshipRepo.save(existing);
            
            // ========== NOTIFICATION FOR UPDATE ==========
            notificationService.notifyAllAdmins(
                "✏️ Internship Updated",
                existing.getCompany().getCompanyName() + " updated internship: " + existing.getTitle(),
                "INTERNSHIP_UPDATED",
                saved.getId().toString()
            );
            
            return saved;
        }).orElseThrow(() -> new RuntimeException("Internship not found"));
    }

    @Transactional
    public boolean deleteInternship(Long id) {
        if (internshipRepo.existsById(id)) {
            Internship internship = internshipRepo.findById(id).get();
            String internshipTitle = internship.getTitle();
            String companyName = internship.getCompany().getCompanyName();
            
            internshipRepo.deleteById(id);
            
            // ========== NOTIFICATION FOR DELETION ==========
            notificationService.notifyAllAdmins(
                "🗑️ Internship Deleted",
                companyName + " deleted internship: " + internshipTitle,
                "INTERNSHIP_DELETED",
                id.toString()
            );
            
            return true;
        }
        return false;
    }

    public Internship getById(Long id) {
        return internshipRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Internship not found"));
    }

    public List<Internship> getAllOpenInternships() {
        return internshipRepo.findByStatus(Internship.Status.OPEN);
    }
}