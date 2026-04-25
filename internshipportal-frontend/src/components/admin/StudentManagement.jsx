import React, { useState, useEffect } from 'react';
import { FiSearch, FiMail, FiPhone, FiBook, FiBriefcase, FiCheckCircle, FiClock, FiEye, FiTrash2, FiUser, FiCalendar, FiAward, FiCode, FiDownload } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import './StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const studentsData = await adminService.getAllStudents();
      console.log('Students data:', studentsData);
      
      let allApplications = [];
      try {
        allApplications = await adminService.getAllApplications();
        console.log('All applications count:', allApplications.length);
      } catch (error) {
        console.log('Could not fetch applications:', error);
      }
      
      // Group applications by studentId
      const applicationsByStudent = {};
      if (allApplications && Array.isArray(allApplications)) {
        allApplications.forEach(app => {
          const studentId = app.student?.id || app.studentId;
          if (studentId) {
            if (!applicationsByStudent[studentId]) {
              applicationsByStudent[studentId] = [];
            }
            applicationsByStudent[studentId].push(app);
          }
        });
      }
      
      const processedStudents = studentsData.map(student => {
        const studentApps = applicationsByStudent[student.id] || [];
        
        return {
          ...student,
          applications: studentApps,
          totalApplications: studentApps.length,
          acceptedApplications: studentApps.filter(app => 
            app.status?.toUpperCase() === 'ACCEPTED'
          ).length,
          pendingApplications: studentApps.filter(app => 
            ['PENDING', 'SHORTLISTED', 'APPLIED', 'SUBMITTED'].includes(app.status?.toUpperCase())
          ).length,
          rejectedApplications: studentApps.filter(app => 
            app.status?.toUpperCase() === 'REJECTED'
          ).length
        };
      });
      
      setStudents(processedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to extract company name from application
  const getCompanyName = (app) => {
    if (app.internship?.company?.companyName) {
      return app.internship.company.companyName;
    }
    if (app.internship?.company?.name) {
      return app.internship.company.name;
    }
    if (app.companyName) {
      return app.companyName;
    }
    if (app.internship?.companyName) {
      return app.internship.companyName;
    }
    return 'Company information not available';
  };

  // Function to extract internship title from application
  const getInternshipTitle = (app) => {
    if (app.internship?.title) {
      return app.internship.title;
    }
    if (app.title) {
      return app.title;
    }
    if (app.internshipTitle) {
      return app.internshipTitle;
    }
    return 'Untitled Internship';
  };

  // Function to extract application date
  const getApplicationDate = (app) => {
    const date = app.appliedAt || app.applicationDate;
    if (date) {
      return new Date(date).toLocaleDateString();
    }
    return 'Date not available';
  };

  const handleViewStudent = async (student) => {
    if (student.applications && student.applications.length > 0) {
      setSelectedStudent(student);
      setShowModal(true);
      return;
    }
    
    try {
      setLoadingDetails(true);
      let applications = [];
      try {
        const allApps = await adminService.getAllApplications();
        applications = allApps.filter(app => 
          (app.student?.id === student.id) || (app.studentId === student.id)
        );
      } catch (error) {
        console.log('Could not fetch applications:', error);
      }
      
      const mergedStudent = {
        ...student,
        applications: applications,
        totalApplications: applications.length,
        acceptedApplications: applications.filter(app => app.status?.toUpperCase() === 'ACCEPTED').length,
        pendingApplications: applications.filter(app => ['PENDING', 'SHORTLISTED'].includes(app.status?.toUpperCase())).length,
        rejectedApplications: applications.filter(app => app.status?.toUpperCase() === 'REJECTED').length
      };
      
      setSelectedStudent(mergedStudent);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setSelectedStudent({
        ...student,
        applications: [],
        totalApplications: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0
      });
      setShowModal(true);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This will also delete all their applications.')) {
      try {
        await adminService.deleteStudent(studentId);
        await fetchStudents();
        alert('Student deleted successfully');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student');
      }
    }
  };

  const handleDownloadResume = async (filename) => {
    if (!filename) {
      alert('No resume available');
      return;
    }
    
    try {
      await adminService.downloadResume(filename);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.charAt(0).toUpperCase();
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.collegeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.collegeIdNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    total: students.length,
    active: students.length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="student-management">
      <div className="page-header">
        <h2>Student Management</h2>
        <div className="header-stats">
          <div className="stat-chip">
            <FiUser />
            <span>{stats.total}</span> Total Students
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search students by name, email, college, course, branch, or college ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍🎓</div>
          <h3>No students found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map(student => (
            <div key={student.id} className="student-card">
              <div className="student-header">
                <div className="student-info">
                  <div className="student-avatar">
                    {getInitials(student.user?.fullName)}
                  </div>
                  <div className="student-text">
                    <h3>{student.user?.fullName || 'N/A'}</h3>
                    <span className="student-id">ID: {student.id}</span>
                  </div>
                </div>
              </div>

              <div className="student-body">
                <div className="info-row">
                  <FiMail />
                  <strong>Email:</strong>
                  <span>{student.user?.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <FiPhone />
                  <strong>Phone:</strong>
                  <span>{student.user?.phone || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <FiBook />
                  <strong>College:</strong>
                  <span>{student.collegeName || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <FiAward />
                  <strong>Course:</strong>
                  <span>{student.course || 'N/A'} - {student.branch || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <FiCalendar />
                  <strong>Year:</strong>
                  <span>{student.yearOfStudy || 'N/A'} Year | CGPA: {student.cgpa || 'N/A'}</span>
                </div>
                
                {student.skills && (
                  <div className="skills-preview">
                    <FiCode />
                    <strong>Skills:</strong>
                    <div className="skills-tags">
                      {student.skills.split(',').slice(0, 3).map((skill, i) => (
                        <span key={i} className="skill-tag">{skill.trim()}</span>
                      ))}
                      {student.skills.split(',').length > 3 && (
                        <span className="skill-tag more">+{student.skills.split(',').length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="application-stats-preview">
                  <FiBriefcase />
                  <strong>Applications:</strong>
                  <span className="stat-badge total">{student.totalApplications || 0} total</span>
                  {(student.acceptedApplications || 0) > 0 && (
                    <span className="stat-badge accepted">{student.acceptedApplications} accepted</span>
                  )}
                </div>
              </div>

              <div className="student-footer">
                <button 
                  className="action-btn view-btn"
                  onClick={() => handleViewStudent(student)}
                >
                  <FiEye /> View Details
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteStudent(student.id)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details - {selectedStudent.user?.fullName}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {loadingDetails ? (
                <div className="loading-details">
                  <div className="spinner"></div>
                  <p>Loading student details...</p>
                </div>
              ) : (
                <>
                  <div className="modal-section">
                    <h4><FiUser /> Personal Information</h4>
                    <div className="modal-info-grid">
                      <div className="modal-info-item">
                        <span className="modal-info-label">Full Name</span>
                        <span className="modal-info-value">{selectedStudent.user?.fullName || 'N/A'}</span>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-info-label">Email</span>
                        <span className="modal-info-value">{selectedStudent.user?.email || 'N/A'}</span>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-info-label">Phone</span>
                        <span className="modal-info-value">{selectedStudent.user?.phone || 'N/A'}</span>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-info-label">Registered On</span>
                        <span className="modal-info-value">
                          {selectedStudent.user?.registeredAt ? new Date(selectedStudent.user.registeredAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4><FiBook /> Education Details</h4>
                    <div className="modal-info-grid">
                      <div className="modal-info-item">
                        <span className="modal-info-label">College Name</span>
                        <span className="modal-info-value">{selectedStudent.collegeName || 'N/A'}</span>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-info-label">College ID Number</span>
                        <span className="modal-info-value">{selectedStudent.collegeIdNumber || 'Not provided'}</span>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-info-label">Course</span>
                        <span className="modal-info-value">{selectedStudent.course || 'N/A'}</span>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-info-label">Branch</span>
                        <span className="modal-info-value">{selectedStudent.branch || 'N/A'}</span>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-info-label">Year of Study</span>
                        <span className="modal-info-value">{selectedStudent.yearOfStudy || 'N/A'} Year</span>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-info-label">CGPA</span>
                        <span className="modal-info-value">{selectedStudent.cgpa || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedStudent.skills && (
                    <div className="modal-section">
                      <h4><FiCode /> Technical Skills</h4>
                      <div className="skills-list">
                        {selectedStudent.skills.split(',').map((skill, i) => (
                          <span key={i} className="skill-badge">{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedStudent.resumeFilename && (
                    <div className="modal-section">
                      <h4><FiDownload /> Resume</h4>
                      <button 
                        className="download-resume-btn"
                        onClick={() => handleDownloadResume(selectedStudent.resumeFilename)}
                      >
                        <FiDownload /> Download Resume
                      </button>
                    </div>
                  )}

                  <div className="modal-section">
                    <h4><FiBriefcase /> Application Statistics</h4>
                    <div className="stats-mini-grid">
                      <div className="stat-mini-card">
                        <span className="stat-mini-value">{selectedStudent.totalApplications || 0}</span>
                        <span className="stat-mini-label">Total Applications</span>
                      </div>
                      <div className="stat-mini-card">
                        <span className="stat-mini-value">{selectedStudent.acceptedApplications || 0}</span>
                        <span className="stat-mini-label">Accepted</span>
                      </div>
                      <div className="stat-mini-card">
                        <span className="stat-mini-value">{selectedStudent.pendingApplications || 0}</span>
                        <span className="stat-mini-label">Pending</span>
                      </div>
                      <div className="stat-mini-card">
                        <span className="stat-mini-value">{selectedStudent.rejectedApplications || 0}</span>
                        <span className="stat-mini-label">Rejected</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4>Applications Submitted ({selectedStudent.applications?.length || 0})</h4>
                    {selectedStudent.applications && selectedStudent.applications.length > 0 ? (
                      <div className="applications-list">
                        {selectedStudent.applications.map((app, index) => {
                          const internshipTitle = getInternshipTitle(app);
                          const companyName = getCompanyName(app);
                          const applicationDate = getApplicationDate(app);
                          
                          return (
                            <div key={app.id || index} className="application-item">
                              <div className="application-info">
                                <strong>{internshipTitle}</strong>
                                <span className="company-name">{companyName}</span>
                                <span className="application-date">
                                  Applied: {applicationDate}
                                </span>
                              </div>
                              <div className={`application-status-badge ${app.status?.toLowerCase() === 'accepted' ? 'status-accepted' : app.status?.toLowerCase() === 'rejected' ? 'status-rejected' : 'status-pending'}`}>
                                {app.status || 'PENDING'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="no-applications-message">
                        <p>No applications found for this student.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-footer-btn close-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;