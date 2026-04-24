package com.example.demo.service;

import com.example.demo.entity.Student;
import com.example.demo.entity.User;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.demo.util.FileUploadUtil;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    // Get student profile by user ID
    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));
    }

    // Create or update student profile
    @Transactional
    public Student createOrUpdateStudent(Long userId, Student studentData, MultipartFile resume) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        boolean isNew = false;
        Student student = studentRepository.findByUser(user).orElse(null);
        
        if (student == null) {
            isNew = true;
            student = new Student();
            student.setUser(user);
        }
        
        // Update student information
        student.setCollegeName(studentData.getCollegeName());
        student.setCourse(studentData.getCourse());
        student.setBranch(studentData.getBranch());
        student.setYearOfStudy(studentData.getYearOfStudy());
        student.setCgpa(studentData.getCgpa());
        student.setSkills(studentData.getSkills());
        student.setCollegeIdNumber(studentData.getCollegeIdNumber());
        
        // Handle resume upload
        if (resume != null && !resume.isEmpty()) {
            // Delete old resume if exists
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
        
        Student saved = studentRepository.save(student);
        
        // ========== NOTIFICATIONS ==========
        
        if (isNew) {
            // Notify admins about new student registration
            notificationService.notifyAllAdmins(
                "🎓 New Student Registered",
                user.getFullName() + " has registered as a student",
                "STUDENT_NEW",
                saved.getId().toString()
            );
            
            // Notify the student about successful registration
            notificationService.createNotification(
                userId,
                "Welcome to SkillIntern! 🎉",
                "Welcome " + user.getFullName() + "! Your student profile has been created successfully. Start exploring internships now!",
                "STUDENT_REGISTERED",
                saved.getId().toString()
            );
        } else {
            // Notify student about profile update
            notificationService.createNotification(
                userId,
                "Profile Updated Successfully ✅",
                "Your student profile has been updated successfully.",
                "PROFILE_UPDATED",
                saved.getId().toString()
            );
            
            // Notify admins about profile update (optional)
            notificationService.notifyAllAdmins(
                "✏️ Student Profile Updated",
                user.getFullName() + " has updated their student profile",
                "STUDENT_UPDATED",
                saved.getId().toString()
            );
        }
        
        return saved;
    }

    // Update student profile without resume
    @Transactional
    public Student updateStudentProfile(Long userId, Student studentData) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        Student student = studentRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));
        
        // Update student information
        if (studentData.getCollegeName() != null) {
            student.setCollegeName(studentData.getCollegeName());
        }
        if (studentData.getCourse() != null) {
            student.setCourse(studentData.getCourse());
        }
        if (studentData.getBranch() != null) {
            student.setBranch(studentData.getBranch());
        }
        if (studentData.getYearOfStudy() != null) {
            student.setYearOfStudy(studentData.getYearOfStudy());
        }
        if (studentData.getCgpa() != null) {
            student.setCgpa(studentData.getCgpa());
        }
        if (studentData.getSkills() != null) {
            student.setSkills(studentData.getSkills());
        }
        if (studentData.getCollegeIdNumber() != null) {
            student.setCollegeIdNumber(studentData.getCollegeIdNumber());
        }
        
        Student saved = studentRepository.save(student);
        
        // Notify student about profile update
        notificationService.createNotification(
            userId,
            "Profile Updated Successfully ✅",
            "Your student profile has been updated successfully.",
            "PROFILE_UPDATED",
            saved.getId().toString()
        );
        
        return saved;
    }

    // Upload resume only
    @Transactional
    public String uploadResume(Long userId, MultipartFile resume) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        Student student = studentRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));
        
        // Delete old resume if exists
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
        
        studentRepository.save(student);
        
        // Notify student about resume upload
        notificationService.createNotification(
            userId,
            "Resume Uploaded Successfully 📄",
            "Your resume has been uploaded successfully. Companies can now view your resume when you apply.",
            "RESUME_UPLOADED",
            student.getId().toString()
        );
        
        return filename;
    }

    // Delete student profile (soft delete or hard delete)
    @Transactional
    public void deleteStudentProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        Student student = studentRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + userId));
        
        // Delete resume file if exists
        if (student.getResumeFilename() != null) {
            try {
                FileUploadUtil.deleteFile(student.getResumeFilename());
            } catch (Exception e) {
                System.err.println("Error deleting resume: " + e.getMessage());
            }
        }
        
        // Delete student profile
        studentRepository.delete(student);
        
        // Notify admins about profile deletion
        notificationService.notifyAllAdmins(
            "🗑️ Student Profile Deleted",
            user.getFullName() + " has deleted their student profile",
            "STUDENT_DELETED",
            userId.toString()
        );
    }

    // Get student profile with statistics
    public Student getStudentWithStats(Long userId) {
        Student student = getStudentByUserId(userId);
        
        // You can add additional statistics here
        // For example: total applications, acceptance rate, etc.
        
        return student;
    }
}