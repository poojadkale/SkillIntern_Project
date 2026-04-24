package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.entity.*;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.enums.Role;
import com.example.demo.repository.*;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private CompanyRepository companyRepo;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register method
    @Transactional
    public LoginResponse register(RegisterRequest req) {
        // Check if email already exists
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Create and save user
        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(Role.valueOf(req.getRole().toUpperCase()));
        user = userRepo.save(user);

        // Create role-specific profile
        if (user.getRole() == Role.STUDENT) {
            createStudentProfile(user, req);
        } else if (user.getRole() == Role.COMPANY) {
            createCompanyProfile(user, req);
        }

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());
        response.setPhone(user.getPhone() != null ? user.getPhone() : ""); // Add phone to response
        response.setMessage("Registration successful! You can now log in to your account.");
        
        return response;
    }

    private void createStudentProfile(User user, RegisterRequest req) {
        Student student = new Student();
        student.setUser(user);
        student.setCollegeName(req.getCollegeName());
        student.setCourse(req.getCourse());
        student.setBranch(req.getBranch());
        student.setYearOfStudy(req.getYearOfStudy());
        student.setCgpa(req.getCgpa());
        student.setSkills(req.getSkills());
        student.setCollegeIdNumber(req.getCollegeIdNumber());
        studentRepo.save(student);
    }

    private void createCompanyProfile(User user, RegisterRequest req) {
        Company company = new Company();
        company.setUser(user);
        company.setCompanyName(req.getCompanyName());
        company.setWebsite(req.getWebsite());
        company.setLocation(req.getLocation());
        company.setDescription(req.getDescription());
        company.setGstNumber(req.getGstNumber());
        company.setRegistrationNumber(req.getRegistrationNumber());
        companyRepo.save(company);
    }

    // Login method - UPDATED to include phone number
    public LoginResponse login(String email, String password) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());
        response.setPhone(user.getPhone() != null ? user.getPhone() : ""); // Add phone number to response
        response.setMessage("Login successful");
        
        // Log the response for debugging
        System.out.println("Login Response - userId: " + response.getUserId() + 
                           ", email: " + response.getEmail() + 
                           ", fullName: " + response.getFullName() + 
                           ", role: " + response.getRole() +
                           ", phone: " + response.getPhone());
        
        return response;
    }
}