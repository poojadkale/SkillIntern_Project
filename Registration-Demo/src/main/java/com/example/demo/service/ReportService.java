package com.example.demo.service;

import com.example.demo.dto.ReportRequestDTO;
import com.example.demo.dto.ReportResponseDTO;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private InternshipRepository internshipRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    // ========== HELPER METHODS - MUST BE FIRST ==========
    
    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "Not specified";
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
    
    private String formatLocalDate(LocalDate date) {
        if (date == null) return "Not specified";
        return date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
    
    private String formatKey(String key) {
        if (key == null || key.isEmpty()) return key;
        StringBuilder result = new StringBuilder();
        result.append(Character.toUpperCase(key.charAt(0)));
        for (int i = 1; i < key.length(); i++) {
            char c = key.charAt(i);
            if (Character.isUpperCase(c)) {
                result.append(" ").append(Character.toLowerCase(c));
            } else {
                result.append(c);
            }
        }
        return result.toString();
    }
    
    private String getDateRangeText(ReportRequestDTO request) {
        if (request.getStartDate() != null && request.getEndDate() != null) {
            return request.getStartDate() + " to " + request.getEndDate();
        }
        return "All Time";
    }

    // ========== MAIN PUBLIC METHOD ==========
    
    public ReportResponseDTO generateReport(ReportRequestDTO request, String adminName) {
        ReportResponseDTO response = new ReportResponseDTO();
        response.setReportType(request.getReportType());
        response.setGeneratedAt(LocalDateTime.now());
        response.setGeneratedBy(adminName);
        response.setDateRange(getDateRangeText(request));
        
        switch (request.getReportType()) {
            case "INTERNSHIPS":
                generateInternshipReport(response, request);
                break;
            case "APPLICATIONS":
                generateApplicationReport(response, request);
                break;
            case "USERS":
                generateUserReport(response, request);
                break;
            case "COMPANIES":
                generateCompanyReport(response, request);
                break;
            case "STUDENTS":
                generateStudentReport(response, request);
                break;
            case "ACTIVITY":
                generateActivityReport(response, request);
                break;
            default:
                generateInternshipReport(response, request);
        }
        
        return response;
    }
    
    // ========== REPORT GENERATION METHODS ==========
    
    private void generateInternshipReport(ReportResponseDTO response, ReportRequestDTO request) {
        List<Internship> internships = internshipRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalInternships", internships.size());
        summary.put("openInternships", internships.stream().filter(i -> i.getStatus() == Internship.Status.OPEN).count());
        summary.put("closedInternships", internships.stream().filter(i -> i.getStatus() == Internship.Status.CLOSED).count());
        summary.put("totalStipendValue", internships.stream().mapToInt(i -> i.getStipend() != null ? i.getStipend() : 0).sum());
        summary.put("avgStipend", internships.stream().mapToInt(i -> i.getStipend() != null ? i.getStipend() : 0).average().orElse(0));
        summary.put("totalOpenings", internships.stream().mapToInt(i -> i.getNumberOfOpenings() != null ? i.getNumberOfOpenings() : 0).sum());
        response.setSummary(summary);
        
        List<Map<String, Object>> details = internships.stream().map(internship -> {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", internship.getId());
            detail.put("title", internship.getTitle());
            detail.put("companyName", internship.getCompany().getCompanyName());
            detail.put("location", internship.getLocation());
            detail.put("stipend", internship.getStipend());
            detail.put("status", internship.getStatus());
            detail.put("postedAt", formatDateTime(internship.getPostedAt()));
            detail.put("endDate", formatLocalDate(internship.getEndDate()));
            detail.put("applicationsCount", applicationRepository.findByInternship(internship).size());
            return detail;
        }).collect(Collectors.toList());
        response.setDetails(details);
        response.setCharts(new ArrayList<>());
    }
    
    private void generateApplicationReport(ReportResponseDTO response, ReportRequestDTO request) {
        List<Application> applications = applicationRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalApplications", applications.size());
        summary.put("pendingApplications", applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.PENDING).count());
        summary.put("acceptedApplications", applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.ACCEPTED).count());
        summary.put("rejectedApplications", applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.REJECTED).count());
        summary.put("shortlistedApplications", applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.SHORTLISTED).count());
        summary.put("acceptanceRate", applications.size() > 0 ? 
            (applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.ACCEPTED).count() * 100.0 / applications.size()) : 0);
        response.setSummary(summary);
        
        List<Map<String, Object>> details = applications.stream().map(app -> {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", app.getId());
            detail.put("internshipTitle", app.getInternship().getTitle());
            detail.put("companyName", app.getInternship().getCompany().getCompanyName());
            detail.put("studentName", app.getStudent().getUser().getFullName());
            detail.put("studentEmail", app.getStudent().getUser().getEmail());
            detail.put("status", app.getStatus());
            detail.put("appliedAt", formatDateTime(app.getAppliedAt()));
            detail.put("cgpa", app.getCgpa());
            return detail;
        }).collect(Collectors.toList());
        response.setDetails(details);
        response.setCharts(new ArrayList<>());
    }
    
    private void generateUserReport(ReportResponseDTO response, ReportRequestDTO request) {
        List<User> users = userRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUsers", users.size());
        summary.put("totalStudents", users.stream().filter(u -> u.getRole().toString().equals("STUDENT")).count());
        summary.put("totalCompanies", users.stream().filter(u -> u.getRole().toString().equals("COMPANY")).count());
        summary.put("totalAdmins", users.stream().filter(u -> u.getRole().toString().equals("ADMIN")).count());
        summary.put("newUsersThisMonth", users.stream().filter(u -> u.getRegisteredAt() != null && 
            u.getRegisteredAt().getMonth() == LocalDateTime.now().getMonth()).count());
        response.setSummary(summary);
        
        List<Map<String, Object>> details = users.stream().map(user -> {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", user.getId());
            detail.put("fullName", user.getFullName());
            detail.put("email", user.getEmail());
            detail.put("role", user.getRole());
            detail.put("registeredAt", formatDateTime(user.getRegisteredAt()));
            return detail;
        }).collect(Collectors.toList());
        response.setDetails(details);
        response.setCharts(new ArrayList<>());
    }
    
    private void generateCompanyReport(ReportResponseDTO response, ReportRequestDTO request) {
        List<Company> companies = companyRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCompanies", companies.size());
        summary.put("activeCompanies", companies.stream().filter(c -> internshipRepository.findByCompany(c).size() > 0).count());
        summary.put("totalInternshipsPosted", companies.stream().mapToInt(c -> internshipRepository.findByCompany(c).size()).sum());
        summary.put("avgInternshipsPerCompany", companies.size() > 0 ? 
            (double) companies.stream().mapToInt(c -> internshipRepository.findByCompany(c).size()).sum() / companies.size() : 0);
        response.setSummary(summary);
        
        List<Map<String, Object>> details = companies.stream().map(company -> {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", company.getId());
            detail.put("companyName", company.getCompanyName());
            detail.put("location", company.getLocation());
            detail.put("website", company.getWebsite());
            detail.put("internshipsCount", internshipRepository.findByCompany(company).size());
            detail.put("totalApplications", internshipRepository.findByCompany(company).stream()
                .mapToInt(i -> applicationRepository.findByInternship(i).size()).sum());
            return detail;
        }).collect(Collectors.toList());
        response.setDetails(details);
        
        List<Map<String, Object>> charts = new ArrayList<>();
        Map<String, Object> topCompaniesChart = new HashMap<>();
        topCompaniesChart.put("type", "bar");
        topCompaniesChart.put("title", "Top Companies by Internships");
        Map<String, Long> topData = companies.stream()
            .collect(Collectors.toMap(c -> c.getCompanyName(), c -> (long) internshipRepository.findByCompany(c).size()))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));
        topCompaniesChart.put("data", topData);
        charts.add(topCompaniesChart);
        response.setCharts(charts);
    }
    
    private void generateStudentReport(ReportResponseDTO response, ReportRequestDTO request) {
        List<Student> students = studentRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents", students.size());
        summary.put("avgCgpa", students.stream().mapToDouble(s -> s.getCgpa() != null ? s.getCgpa() : 0).average().orElse(0));
        summary.put("totalApplications", students.stream().mapToInt(s -> applicationRepository.findByStudent(s).size()).sum());
        summary.put("avgApplicationsPerStudent", students.size() > 0 ? 
            (double) students.stream().mapToInt(s -> applicationRepository.findByStudent(s).size()).sum() / students.size() : 0);
        summary.put("placementRate", students.size() > 0 ? 
            (students.stream().filter(s -> applicationRepository.findByStudent(s).stream()
                .anyMatch(a -> a.getStatus() == Application.ApplicationStatus.ACCEPTED)).count() * 100.0 / students.size()) : 0);
        response.setSummary(summary);
        
        List<Map<String, Object>> details = students.stream().map(student -> {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", student.getId());
            detail.put("name", student.getUser().getFullName());
            detail.put("email", student.getUser().getEmail());
            detail.put("college", student.getCollegeName());
            detail.put("course", student.getCourse());
            detail.put("cgpa", student.getCgpa());
            detail.put("applicationsCount", applicationRepository.findByStudent(student).size());
            detail.put("acceptedCount", applicationRepository.findByStudent(student).stream()
                .filter(a -> a.getStatus() == Application.ApplicationStatus.ACCEPTED).count());
            return detail;
        }).collect(Collectors.toList());
        response.setDetails(details);
        
        List<Map<String, Object>> charts = new ArrayList<>();
        Map<String, Object> cgpaChart = new HashMap<>();
        cgpaChart.put("type", "histogram");
        cgpaChart.put("title", "CGPA Distribution");
        Map<String, Long> cgpaData = new LinkedHashMap<>();
        cgpaData.put("0-5", students.stream().filter(s -> s.getCgpa() != null && s.getCgpa() < 5).count());
        cgpaData.put("5-6", students.stream().filter(s -> s.getCgpa() != null && s.getCgpa() >= 5 && s.getCgpa() < 6).count());
        cgpaData.put("6-7", students.stream().filter(s -> s.getCgpa() != null && s.getCgpa() >= 6 && s.getCgpa() < 7).count());
        cgpaData.put("7-8", students.stream().filter(s -> s.getCgpa() != null && s.getCgpa() >= 7 && s.getCgpa() < 8).count());
        cgpaData.put("8-9", students.stream().filter(s -> s.getCgpa() != null && s.getCgpa() >= 8 && s.getCgpa() < 9).count());
        cgpaData.put("9-10", students.stream().filter(s -> s.getCgpa() != null && s.getCgpa() >= 9).count());
        cgpaChart.put("data", cgpaData);
        charts.add(cgpaChart);
        response.setCharts(charts);
    }
    
    private void generateActivityReport(ReportResponseDTO response, ReportRequestDTO request) {
        List<Application> applications = applicationRepository.findAll();
        List<Internship> internships = internshipRepository.findAll();
        List<User> users = userRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalApplications", applications.size());
        summary.put("totalInternshipsPosted", internships.size());
        summary.put("totalNewUsers", users.size());
        response.setSummary(summary);
        
        List<Map<String, Object>> details = new ArrayList<>();
        response.setDetails(details);
        response.setCharts(new ArrayList<>());
    }
    
    // ========== CSV GENERATION METHOD ==========
    
    public byte[] generateCSVReport(ReportRequestDTO request, String adminName) {
        ReportResponseDTO report = generateReport(request, adminName);
        StringBuilder csv = new StringBuilder();
        
        csv.append("# Report Type: ").append(report.getReportType()).append("\n");
        csv.append("# Generated: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        csv.append("# Generated By: ").append(adminName).append("\n");
        csv.append("# Period: ").append(report.getDateRange()).append("\n");
        csv.append("\n");
        
        csv.append("SUMMARY\n");
        if (report.getSummary() != null && !report.getSummary().isEmpty()) {
            csv.append("Metric,Value\n");
            for (Map.Entry<String, Object> entry : report.getSummary().entrySet()) {
                String key = formatKey(entry.getKey());
                Object value = entry.getValue();
                csv.append("\"").append(key).append("\",\"").append(value).append("\"\n");
            }
        }
        csv.append("\n");
        
        if (report.getDetails() != null && !report.getDetails().isEmpty()) {
            csv.append("DETAILS\n");
            List<String> headers = new ArrayList<>(report.getDetails().get(0).keySet());
            csv.append(String.join(",", headers)).append("\n");
            
            for (Map<String, Object> row : report.getDetails()) {
                List<String> rowValues = new ArrayList<>();
                for (String header : headers) {
                    Object value = row.get(header);
                    if (value != null) {
                        String strValue = value.toString();
                        if (strValue.contains(",") || strValue.contains("\"")) {
                            strValue = "\"" + strValue.replace("\"", "\"\"") + "\"";
                        }
                        rowValues.add(strValue);
                    } else {
                        rowValues.add("-");
                    }
                }
                csv.append(String.join(",", rowValues)).append("\n");
            }
        }
        
        return csv.toString().getBytes();
    }
}