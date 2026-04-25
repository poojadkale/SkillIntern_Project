// src/components/student/StudentApplications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import companyService from '../../services/companyService';
import { 
  FiCalendar, FiMapPin, FiDollarSign, FiClock, FiEye, FiBriefcase, 
  FiUser, FiBook, FiCode, FiX, FiDownload, FiCheckCircle, 
  FiClock as FiClockIcon, FiXCircle, FiStar, FiTrendingUp, FiAward,
  FiMail, FiPhone, FiMap, FiCalendar as FiCalendarIcon, FiMessageSquare
} from 'react-icons/fi';
import './StudentApplications.css';

const StudentApplications = () => {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      let studentId = user?.userId || user?.id;
      if (!studentId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          studentId = parsed.userId || parsed.id;
        }
      }
      if (studentId) loadApplications(Number(studentId));
      else setLoading(false);
    }
  }, [authLoading, user]);

  const loadApplications = async (studentId) => {
    try {
      setLoading(true);
      const data = await companyService.getStudentApplications(studentId);
      console.log('Applications data:', data);
      
      let apps = [];
      if (Array.isArray(data)) {
        apps = data;
      } else if (data?.data && Array.isArray(data.data)) {
        apps = data.data;
      } else {
        apps = [];
      }
      
      // Process applications to ensure reviewComments is properly mapped
      const processedApps = apps.map(app => ({
        ...app,
        reviewComments: app.reviewComments || app.adminResponse || app.feedback || null,
        status: app.status || 'PENDING'
      }));
      
      setApplications(processedApps);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    switch(statusLower) {
      case 'accepted':
        return { 
          class: 'status-accepted', 
          text: 'Accepted', 
          icon: <FiCheckCircle />,
          description: 'Congratulations! Your application has been accepted.'
        };
      case 'rejected':
        return { 
          class: 'status-rejected', 
          text: 'Rejected', 
          icon: <FiXCircle />,
          description: 'Sorry, your application was not selected this time.'
        };
      case 'shortlisted':
        return { 
          class: 'status-shortlisted', 
          text: 'Shortlisted', 
          icon: <FiStar />,
          description: 'Great news! You have been shortlisted for further rounds.'
        };
      case 'reviewed':
        return { 
          class: 'status-reviewed', 
          text: 'Reviewed', 
          icon: <FiTrendingUp />,
          description: 'Your application has been reviewed by the company.'
        };
      default:
        return { 
          class: 'status-pending', 
          text: 'Pending', 
          icon: <FiClockIcon />,
          description: 'Your application is waiting for company review.'
        };
    }
  };

  const formatStipend = (stipend) => {
    if (!stipend && stipend !== 0) return 'Not specified';
    if (stipend === 0) return 'Unpaid';
    return `₹${stipend.toLocaleString()}/month`;
  };

  if (authLoading || loading) {
    return (
      <div className="applications-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <div className="page-header">
        <div>
          <h1>My Applications</h1>
          <p>Track and manage all your internship applications in one place</p>
        </div>
        <div className="header-stats">
          <span className="stat-count">{applications.length}</span>
          <span className="stat-label">Total Applications</span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No applications yet</h3>
          <p>Start your internship journey by applying to opportunities</p>
          <button className="primary-btn" onClick={() => window.location.href = '/internships'}>Browse Internships</button>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            
            return (
              <div key={app.id} className="application-card">
                {/* Status Badge */}
                <div className={`status-badge-top ${statusConfig.class}`}>
                  {statusConfig.icon}
                  {statusConfig.text}
                </div>

                {/* Company Header */}
                <div className="company-header-section">
                  <div className="company-logo">
                    <FiBriefcase />
                  </div>
                  <div className="company-info">
                    <h3 className="internship-title">{app.internshipTitle || 'Internship Position'}</h3>
                    <p className="company-name-text">{app.companyName || 'Company'}</p>
                  </div>
                </div>

                {/* Internship Details Grid */}
                <div className="details-grid-section">
                  <div className="detail-card">
                    <FiMapPin className="detail-card-icon" />
                    <div>
                      <span className="detail-label">Location</span>
                      <p className="detail-value">{app.internshipLocation || 'Remote'}</p>
                    </div>
                  </div>
                  <div className="detail-card">
                    <FiDollarSign className="detail-card-icon" />
                    <div>
                      <span className="detail-label">Stipend</span>
                      <p className="detail-value">{formatStipend(app.stipend)}</p>
                    </div>
                  </div>
                  <div className="detail-card">
                    <FiClock className="detail-card-icon" />
                    <div>
                      <span className="detail-label">Duration</span>
                      <p className="detail-value">{app.duration || '3 months'}</p>
                    </div>
                  </div>
                  <div className="detail-card">
                    <FiCalendar className="detail-card-icon" />
                    <div>
                      <span className="detail-label">Applied On</span>
                      <p className="detail-value">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                {app.requiredSkills && (
                  <div className="skills-section">
                    <div className="skills-header">
                      <FiCode />
                      <span>Skills Required</span>
                    </div>
                    <div className="skills-tags">
                      {app.requiredSkills.split(',').slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill.trim()}</span>
                      ))}
                      {app.requiredSkills.split(',').length > 4 && (
                        <span className="skill-tag more">+{app.requiredSkills.split(',').length - 4}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                <div className={`status-message ${statusConfig.class}`}>
                  {statusConfig.icon}
                  <span>{statusConfig.description}</span>
                </div>

                {/* Show Review Comments if available */}
                {app.reviewComments && (
                  <div className="review-comments-preview">
                    <FiMessageSquare className="review-icon" />
                    <div className="review-content">
                      <strong>Company Feedback:</strong>
                      <p>{app.reviewComments}</p>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="card-actions">
                  <button className="btn-view-details" onClick={() => setSelectedApp(app)}>
                    <FiEye /> View Full Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedApp.internshipTitle || 'Internship Position'}</h2>
                <p className="modal-company">{selectedApp.companyName || 'Company'}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s ease',
                  flexShrink: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Status Section */}
              <div className={`status-large ${getStatusConfig(selectedApp.status).class}`}>
                {getStatusConfig(selectedApp.status).icon} {getStatusConfig(selectedApp.status).text}
              </div>
              
              <div className="dates">
                <p><strong>Applied on:</strong> {selectedApp.appliedAt ? new Date(selectedApp.appliedAt).toLocaleString() : 'N/A'}</p>
                {selectedApp.reviewedAt && (
                  <p><strong>Reviewed on:</strong> {new Date(selectedApp.reviewedAt).toLocaleString()}</p>
                )}
              </div>

              {/* Internship Details */}
              <div className="info-card">
                <h3><FiBriefcase /> Internship Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{selectedApp.internshipLocation || 'Remote'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Stipend</span>
                    <span className="info-value">{formatStipend(selectedApp.stipend)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{selectedApp.duration || '3 months'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Work Type</span>
                    <span className="info-value">{selectedApp.type || 'Full-time'}</span>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              {selectedApp.requiredSkills && (
                <div className="info-card">
                  <h3><FiCode /> Required Skills</h3>
                  <div className="skills-container">
                    {selectedApp.requiredSkills.split(',').map((skill, idx) => (
                      <span key={idx} className="skill-badge">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="info-card">
                <h3><FiUser /> Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{selectedApp.fullName || selectedApp.studentName || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedApp.email || selectedApp.studentEmail || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedApp.phone || selectedApp.studentPhone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Education Details */}
              <div className="info-card">
                <h3><FiBook /> Education Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">College Name</span>
                    <span className="info-value">{selectedApp.collegeName || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Course</span>
                    <span className="info-value">{selectedApp.course || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Branch</span>
                    <span className="info-value">{selectedApp.branch || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Year of Study</span>
                    <span className="info-value">{selectedApp.yearOfStudy ? `${selectedApp.yearOfStudy} Year` : 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">CGPA</span>
                    <span className="info-value">{selectedApp.cgpa || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Your Skills */}
              {selectedApp.skills && (
                <div className="info-card">
                  <h3><FiCode /> Your Skills</h3>
                  <div className="skills-container">
                    {selectedApp.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="skill-badge your-skill">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="info-card">
                  <h3>Cover Letter</h3>
                  <p className="text-content">{selectedApp.coverLetter}</p>
                </div>
              )}

              {/* Why Hire You */}
              {selectedApp.whyHireYou && (
                <div className="info-card">
                  <h3>Why should we hire you?</h3>
                  <p className="text-content">{selectedApp.whyHireYou}</p>
                </div>
              )}

              {/* Projects */}
              {selectedApp.projects && (
                <div className="info-card">
                  <h3>Projects</h3>
                  <p className="text-content">{selectedApp.projects}</p>
                </div>
              )}

              {/* Achievements */}
              {selectedApp.achievements && (
                <div className="info-card">
                  <h3><FiAward /> Achievements</h3>
                  <p className="text-content">{selectedApp.achievements}</p>
                </div>
              )}

              {/* Feedback from Company - Prominently Displayed */}
              {selectedApp.reviewComments && (
                <div className="info-card feedback-card">
                  <h3><FiMessageSquare /> Feedback from Company</h3>
                  <div className="feedback-content">
                    <p className="feedback-text">{selectedApp.reviewComments}</p>
                  </div>
                </div>
              )}

              {/* Resume Button */}
              {selectedApp.resumePath && (
                <button className="resume-btn" onClick={() => window.open(selectedApp.resumePath, '_blank')}>
                  <FiDownload /> Download Resume
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;