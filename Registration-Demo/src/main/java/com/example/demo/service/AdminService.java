package com.example.demo.service;

import com.example.demo.dto.AdminResponseDTO;
import com.example.demo.dto.StatisticsDTO;
import com.example.demo.entity.*;
import com.example.demo.enums.Role;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    // Get all users with their details
    public List<AdminResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new AdminResponseDTO(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getRole().name()
                ))
                .collect(Collectors.toList());
    }

    // Get all companies (basic info)
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    // Get all companies with complete details (including GST, registration, contact)
    public List<Map<String, Object>> getAllCompaniesWithDetails() {
        List<Company> companies = companyRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Company company : companies) {
            result.add(getCompanyCompleteDetails(company));
        }
        
        return result;
    }

    // Get single company complete details
    public Map<String, Object> getCompanyCompleteDetails(Long companyId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
        return getCompanyCompleteDetails(company);
    }

    // Helper method to get complete company details
    private Map<String, Object> getCompanyCompleteDetails(Company company) {
        Map<String, Object> companyData = new HashMap<>();
        User user = company.getUser();
        
        // Basic Company Information
        companyData.put("id", company.getId());
        companyData.put("companyName", company.getCompanyName());
        companyData.put("location", company.getLocation());
        companyData.put("website", company.getWebsite());
        companyData.put("description", company.getDescription());
        
        // Registration/Verification Details
        companyData.put("gstNumber", company.getGstNumber());
        companyData.put("registrationNumber", company.getRegistrationNumber());
        
        // Contact Person Details
        if (user != null) {
            companyData.put("contactName", user.getFullName());
            companyData.put("email", user.getEmail());
            companyData.put("phone", user.getPhone());
            companyData.put("registeredAt", user.getRegisteredAt());
        }
        
        // Statistics
        int totalInternships = internshipRepository.findByCompany(company).size();
        int activeInternships = internshipRepository.findByCompanyAndStatus(company, Internship.Status.OPEN).size();
        int totalApplications = 0;
        
        List<Internship> internships = internshipRepository.findByCompany(company);
        for (Internship internship : internships) {
            totalApplications += applicationRepository.findByInternship(internship).size();
        }
        
        companyData.put("totalInternships", totalInternships);
        companyData.put("activeInternships", activeInternships);
        companyData.put("totalApplications", totalApplications);
        
        // List of internships with application counts
        List<Map<String, Object>> internshipList = new ArrayList<>();
        for (Internship internship : internships) {
            Map<String, Object> internshipData = new HashMap<>();
            internshipData.put("id", internship.getId());
            internshipData.put("title", internship.getTitle());
            internshipData.put("status", internship.getStatus().toString());
            internshipData.put("applications", applicationRepository.findByInternship(internship).size());
            internshipList.add(internshipData);
        }
        companyData.put("internships", internshipList);
        
        return companyData;
    }

    // ==================== STUDENT MANAGEMENT METHODS ====================

    // Get all students (basic info) - keep for compatibility
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // NEW: Get all students with complete details (including applications, statistics)
    public List<Map<String, Object>> getAllStudentsWithDetails() {
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Student student : students) {
            result.add(getStudentCompleteDetails(student));
        }
        
        return result;
    }

    // NEW: Get single student complete details
    public Map<String, Object> getStudentCompleteDetails(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        return getStudentCompleteDetails(student);
    }

    // Helper method to get complete student details
    private Map<String, Object> getStudentCompleteDetails(Student student) {
        Map<String, Object> studentData = new HashMap<>();
        User user = student.getUser();
        
        // Basic Information
        studentData.put("id", student.getId());
        studentData.put("collegeName", student.getCollegeName());
        studentData.put("course", student.getCourse());
        studentData.put("branch", student.getBranch());
        studentData.put("yearOfStudy", student.getYearOfStudy());
        studentData.put("cgpa", student.getCgpa());
        studentData.put("skills", student.getSkills());
        studentData.put("collegeIdNumber", student.getCollegeIdNumber());
        studentData.put("resumeFilename", student.getResumeFilename());
        
        // User details
        if (user != null) {
            studentData.put("fullName", user.getFullName());
            studentData.put("email", user.getEmail());
            studentData.put("phone", user.getPhone());
            studentData.put("registeredAt", user.getRegisteredAt());
        }
        
        // Applications and Statistics
        List<Application> applications = applicationRepository.findByStudent(student);
        
        long totalApplications = applications.size();
        long pendingApplications = applications.stream()
            .filter(a -> a.getStatus() == Application.ApplicationStatus.PENDING)
            .count();
        long acceptedApplications = applications.stream()
            .filter(a -> a.getStatus() == Application.ApplicationStatus.ACCEPTED)
            .count();
        long rejectedApplications = applications.stream()
            .filter(a -> a.getStatus() == Application.ApplicationStatus.REJECTED)
            .count();
        long shortlistedApplications = applications.stream()
            .filter(a -> a.getStatus() == Application.ApplicationStatus.SHORTLISTED)
            .count();
        
        studentData.put("totalApplications", totalApplications);
        studentData.put("pendingApplications", pendingApplications);
        studentData.put("acceptedApplications", acceptedApplications);
        studentData.put("rejectedApplications", rejectedApplications);
        studentData.put("shortlistedApplications", shortlistedApplications);
        
        // Applications list with details
        List<Map<String, Object>> applicationList = new ArrayList<>();
        for (Application app : applications) {
            Map<String, Object> appData = new HashMap<>();
            appData.put("id", app.getId());
            appData.put("internshipTitle", app.getInternship().getTitle());
            appData.put("companyName", app.getInternship().getCompany().getCompanyName());
            appData.put("companyId", app.getInternship().getCompany().getId());
            appData.put("status", app.getStatus().toString());
            appData.put("appliedAt", app.getAppliedAt());
            appData.put("reviewComments", app.getReviewComments());
            applicationList.add(appData);
        }
        studentData.put("applications", applicationList);
        
        return studentData;
    }

    // Get all internships
    public List<Internship> getAllInternships() {
        return internshipRepository.findAll();
    }

    // Get all applications
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    // Get applications by status
    public List<Application> getApplicationsByStatus(String status) {
        Application.ApplicationStatus appStatus = Application.ApplicationStatus.valueOf(status.toUpperCase());
        List<Application> allApplications = applicationRepository.findAll();
        return allApplications.stream()
                .filter(app -> app.getStatus() == appStatus)
                .collect(Collectors.toList());
    }

    // Get statistics
    public StatisticsDTO getStatistics() {
        StatisticsDTO stats = new StatisticsDTO();
        
        stats.setTotalUsers(userRepository.count());
        stats.setTotalCompanies(companyRepository.count());
        stats.setTotalStudents(studentRepository.count());
        stats.setTotalInternships(internshipRepository.count());
        stats.setTotalApplications(applicationRepository.count());
        
        // Get applications by status
        List<Application> allApplications = applicationRepository.findAll();
        
        stats.setPendingApplications(
            allApplications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.PENDING)
                .count()
        );
        
        // Count approved applications (ACCEPTED or SHORTLISTED)
        stats.setApprovedApplications(
            allApplications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.ACCEPTED || 
                              app.getStatus() == Application.ApplicationStatus.SHORTLISTED)
                .count()
        );
        
        stats.setRejectedApplications(
            allApplications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.REJECTED)
                .count()
        );
        
        return stats;
    }

    // Delete user and associated data
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete associated data based on role
        if (user.getRole() == Role.STUDENT) {
            studentRepository.findByUser(user).ifPresent(student -> {
                // Delete applications first
                List<Application> applications = applicationRepository.findByStudent(student);
                applicationRepository.deleteAll(applications);
                studentRepository.delete(student);
            });
        } else if (user.getRole() == Role.COMPANY) {
            companyRepository.findByUser(user).ifPresent(company -> {
                // Delete internships and their applications
                List<Internship> internships = internshipRepository.findByCompany(company);
                for (Internship internship : internships) {
                    List<Application> applications = applicationRepository.findByInternship(internship);
                    applicationRepository.deleteAll(applications);
                }
                internshipRepository.deleteAll(internships);
                companyRepository.delete(company);
            });
        } else if (user.getRole() == Role.ADMIN) {
            // Just delete the admin user directly
            userRepository.delete(user);
            return;
        }
        
        userRepository.delete(user);
    }

    // Delete company and associated data
    @Transactional
    public void deleteCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        // Delete internships and their applications
        List<Internship> internships = internshipRepository.findByCompany(company);
        for (Internship internship : internships) {
            List<Application> applications = applicationRepository.findByInternship(internship);
            applicationRepository.deleteAll(applications);
        }
        internshipRepository.deleteAll(internships);
        
        // Delete the company
        companyRepository.delete(company);
        
        // Delete the associated user if exists
        if (company.getUser() != null) {
            userRepository.delete(company.getUser());
        }
    }

    // Delete student and associated data
    @Transactional
    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Delete applications
        List<Application> applications = applicationRepository.findByStudent(student);
        applicationRepository.deleteAll(applications);
        
        // Delete the student
        studentRepository.delete(student);
        
        // Delete the associated user if exists
        if (student.getUser() != null) {
            userRepository.delete(student.getUser());
        }
    }

    // Delete internship and associated applications
    @Transactional
    public void deleteInternship(Long internshipId) {
        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new RuntimeException("Internship not found"));
        
        // Delete all applications for this internship
        List<Application> applications = applicationRepository.findByInternship(internship);
        applicationRepository.deleteAll(applications);
        
        internshipRepository.delete(internship);
    }

    // Update application status
    @Transactional
    public void updateApplicationStatus(Long applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        Application.ApplicationStatus newStatus = Application.ApplicationStatus.valueOf(status.toUpperCase());
        application.setStatus(newStatus);
        application.setReviewedAt(java.time.LocalDateTime.now());
        applicationRepository.save(application);
    }

    // Get company details (basic) - keep for compatibility
    public Company getCompanyDetails(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    // Get student details (basic) - keep for compatibility
    public Student getStudentDetails(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }
    
    // Get applications for a specific company
    public List<Application> getApplicationsByCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return applicationRepository.findByInternship_Company(company);
    }
    
    // Get applications for a specific student
    public List<Application> getApplicationsByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return applicationRepository.findByStudent(student);
    }
    
    // Get internship details with applications count
    public Internship getInternshipDetails(Long internshipId) {
        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new RuntimeException("Internship not found"));
        return internship;
    }
}