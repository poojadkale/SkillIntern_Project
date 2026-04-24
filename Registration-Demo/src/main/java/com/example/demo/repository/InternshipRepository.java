// com.example.demo.repository.InternshipRepository.java
package com.example.demo.repository;

import com.example.demo.entity.Internship;
import com.example.demo.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByCompany(Company company);
    List<Internship> findByCompanyAndStatus(Company company, Internship.Status status);
    List<Internship> findByStatus(Internship.Status status);
    
    // Add this search method
    @Query("SELECT i FROM Internship i WHERE i.status = 'OPEN' AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.company.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Internship> searchByTitleOrCompany(@Param("query") String query);
}