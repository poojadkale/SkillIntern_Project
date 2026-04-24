package com.example.demo.controller;

import com.example.demo.dto.ReportRequestDTO;
import com.example.demo.dto.ReportResponseDTO;
import com.example.demo.service.ReportService;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReportTypes() {
        Map<String, Object> response = new HashMap<>();
        response.put("reportTypes", new String[]{
            "INTERNSHIPS", "APPLICATIONS", "USERS", "COMPANIES", "STUDENTS", "ACTIVITY"
        });
        response.put("dateRanges", new String[]{"TODAY", "WEEK", "MONTH", "YEAR", "CUSTOM"});
        response.put("formats", new String[]{"CSV"});
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateReport(@RequestBody ReportRequestDTO request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User admin = userRepository.findByEmail(email).orElse(null);
            String adminName = admin != null ? admin.getFullName() : "System Administrator";
            
            ReportResponseDTO response = reportService.generateReport(request, adminName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/download")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> downloadReport(@RequestBody ReportRequestDTO request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User admin = userRepository.findByEmail(email).orElse(null);
            String adminName = admin != null ? admin.getFullName() : "System Administrator";
            
            String timestamp = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = request.getReportType().toLowerCase() + "_report_" + timestamp + ".csv";
            
            byte[] csvData = reportService.generateCSVReport(request, adminName);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvData);
                    
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}