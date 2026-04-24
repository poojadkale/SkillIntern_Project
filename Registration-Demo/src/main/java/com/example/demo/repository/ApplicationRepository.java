// com.example.demo.repository.ApplicationRepository.java
package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.Application;
import com.example.demo.entity.Internship;
import com.example.demo.entity.Student;
import com.example.demo.entity.Company;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(Student student);
    List<Application> findByInternship(Internship internship);
    List<Application> findByInternship_Company(Company company);
    Optional<Application> findByInternshipIdAndStudentId(Long internshipId, Long studentId);
    boolean existsByInternshipIdAndStudentId(Long internshipId, Long studentId);
    
    
    List<Application> findByStatus(Application.ApplicationStatus status);
}