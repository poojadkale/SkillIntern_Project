// src/main/java/com/example/demo/repository/CompanyRepository.java
package com.example.demo.repository;

import com.example.demo.entity.Company;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUser(User user);
    Optional<Company> findByUserId(Long userId);
    List<Company> findByApprovalStatus(String approvalStatus);
}