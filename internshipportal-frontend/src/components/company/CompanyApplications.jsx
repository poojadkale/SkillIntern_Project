import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import companyService from '../../services/companyService';
import { 
  FiBriefcase, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiEye,
  FiFile,
  FiDownload,
  FiStar,
  FiThumbsUp,
  FiThumbsDown,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiUser,
  FiMail,
  FiPhone,
  FiBook,
  FiCode,
  FiAward,
  FiMessageSquare,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './CompanyApplications.css';

const CompanyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [detailsModal, setDetailsModal] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    reviewComments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [internshipsData, applicationsData] = await Promise.all([
        companyService.getCompanyInternships(user.id),
        companyService.getCompanyApplications(user.id)
      ]);
      
      setInternships(internshipsData || []);
      
      // Create a map of internship details for quick lookup
      const internshipMap = new Map();
      (internshipsData || []).forEach(internship => {
        internshipMap.set(internship.id, internship);
      });
      
      // Process applications to ensure all fields are accessible
      const processedApps = (applicationsData || []).map(app => {
        // Get internship details if available
        const internshipDetails = internshipMap.get(app.internshipId);
        
        return {
          ...app,
          studentName: app.studentName || app.fullName || app.name || 'Student',
          studentEmail: app.email || app.studentEmail || app.student?.email || 'Not provided',
          studentPhone: app.phone || app.studentPhone || app.student?.phone || 'Not provided',
          resumePath: app.resumePath || app.resumeFilename || app.resumeUrl || null,
          resumeFilename: app.resumeFilename || app.resumePath?.split('/').pop() || null,
          // Get stipend from internship details
          stipend: app.stipend || internshipDetails?.stipend || 0,
          internshipLocation: app.internshipLocation || internshipDetails?.location || 'Not specified',
          internshipDuration: app.duration || internshipDetails?.duration || 'Not specified',
          internshipType: app.type || internshipDetails?.type || 'Online'
        };
      });
      
      setApplications(processedApps);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationCount = (internshipId) => {
    return applications.filter(app => app.internshipId === internshipId).length;
  };

  const filteredApplications = selectedInternship === 'all' 
    ? applications 
    : applications.filter(app => app.internshipId === parseInt(selectedInternship));

  const handleReview = async (applicationId) => {
    if (!reviewData.status) {
      toast.error('Please select a decision');
      return;
    }

    try {
      const payload = {
        status: reviewData.status,
        reviewComments: reviewData.reviewComments || ''
      };
      
      await companyService.reviewApplication(applicationId, payload);
      toast.success('Application reviewed successfully');
      setReviewModal(null);
      setReviewData({ status: '', reviewComments: '' });
      fetchData();
    } catch (error) {
      console.error('Error reviewing application:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to review application';
      toast.error(errorMsg);
    }
  };

  const openReviewModal = (application) => {
    setReviewModal(application);
    setReviewData({ status: '', reviewComments: '' });
  };

  const openDetailsModal = (application) => {
    setDetailsModal(application);
  };

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'PENDING': return <FiClock className="status-icon pending" />;
      case 'ACCEPTED': return <FiThumbsUp className="status-icon accepted" />;
      case 'REJECTED': return <FiThumbsDown className="status-icon rejected" />;
      default: return <FiClock className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status?.toLowerCase() || 'pending'}`;
  };

  const handleDownloadResume = async (resumePath, filename) => {
    if (!resumePath && !filename) {
      toast.error('No resume available');
      return;
    }
    
    try {
      toast.loading('Downloading resume...', { id: 'resume-download' });
      
      const downloadFile = filename || (resumePath?.split('/').pop()) || resumePath;
      
      if (!downloadFile) {
        toast.dismiss('resume-download');
        toast.error('Invalid resume file reference');
        return;
      }
      
      console.log('Downloading file:', downloadFile);
      
      const response = await companyService.downloadResume(downloadFile);
      
      toast.dismiss('resume-download');
      
      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', downloadFile);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Resume downloaded successfully!');
      } else {
        toast.error('Unable to download resume');
      }
    } catch (error) {
      toast.dismiss('resume-download');
      console.error('Error downloading resume:', error);
      
      if (error.response?.status === 400) {
        toast.error('Invalid resume file request');
      } else if (error.response?.status === 404) {
        toast.error('Resume file not found');
      } else if (error.response?.status === 500) {
        toast.error('Server error while downloading resume');
      } else {
        toast.error(error.response?.data?.message || 'Failed to download resume');
      }
    }
  };

  const formatStipend = (stipend) => {
    if (!stipend && stipend !== 0) return 'Not specified';
    if (stipend === 0) return 'Unpaid';
    return `₹${stipend.toLocaleString()}/month`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="company-applications">
      {/* Header */}
      <div className="applications-header">
        <h1 className="header-title">Internship Applications</h1>
        <p className="header-subtitle">Review and manage candidate applications</p>
      </div>

      {/* Internship Stats Cards */}
      <div className="internship-stats">
        <div 
          className={`stat-card ${selectedInternship === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedInternship('all')}
        >
          <div className="stat-icon all">
            <FiBriefcase />
          </div>
          <div className="stat-content">
            <span className="stat-value">{applications.length}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>

        {internships.map(internship => (
          <div 
            key={internship.id}
            className={`stat-card ${selectedInternship === internship.id.toString() ? 'active' : ''}`}
            onClick={() => setSelectedInternship(internship.id.toString())}
          >
            <div className="stat-icon internship">
              <FiUsers />
            </div>
            <div className="stat-content">
              <span className="stat-value">{getApplicationCount(internship.id)}</span>
              <span className="stat-label">{internship.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          <FiBriefcase className="empty-icon" />
          <h3>No applications found</h3>
          <p>There are no applications for this internship yet.</p>
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map(app => (
            <div key={app.id} className="application-card">
              <div className={getStatusClass(app.status)}>
                {getStatusIcon(app.status)}
                <span>{app.status || 'PENDING'}</span>
              </div>

              <div className="card-content">
                <h3 className="internship-title">{app.internshipTitle || 'Internship Position'}</h3>
                
                <div className="applicant-info">
                  <span className="applicant-name">{app.studentName}</span>
                </div>

                <div className="application-meta">
                  <div className="meta-item">
                    <FiCalendar className="meta-icon" />
                    <span>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB') : 'N/A'}</span>
                  </div>
                  
                  <div className="meta-item">
                    <FiBook className="meta-icon" />
                    <span>{app.collegeName || 'Not specified'}</span>
                  </div>

                  <div className="meta-item">
                    <FiCode className="meta-icon" />
                    <span>{app.course || 'Not specified'} {app.cgpa ? `• CGPA: ${app.cgpa}` : ''}</span>
                  </div>
                </div>

                <div className="skills-preview">
                  {app.skills?.split(',').slice(0, 3).map((skill, i) => (
                    <span key={i} className="skill-tag">{skill.trim()}</span>
                  ))}
                  {app.skills?.split(',').length > 3 && (
                    <span className="skill-tag more">+{app.skills.split(',').length - 3}</span>
                  )}
                  {!app.skills && <span className="skill-tag">No skills listed</span>}
                </div>

                <div className="card-actions">
                  <button 
                    className="view-btn"
                    onClick={() => openDetailsModal(app)}
                  >
                    <FiEye /> View Full Details
                  </button>
                  {app.status === 'PENDING' && (
                    <button 
                      className="review-btn"
                      onClick={() => openReviewModal(app)}
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {detailsModal && (
        <div className="details-modal-overlay" onClick={() => setDetailsModal(null)}>
          <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="details-modal-close"
              onClick={() => setDetailsModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: '#f8fafc',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1.2rem',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <FiX />
            </button>

            <div className="details-modal-header">
              <h2>Application Details</h2>
              <div className={`status-badge-large ${detailsModal.status?.toLowerCase() || 'pending'}`}>
                {getStatusIcon(detailsModal.status)}
                <span>{detailsModal.status || 'PENDING'}</span>
              </div>
            </div>

            <div className="details-modal-body">
              {/* Student Information Section */}
              <div className="info-section">
                <h3>
                  <FiUser className="section-icon" />
                  Student Information
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{detailsModal.studentName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{detailsModal.studentEmail}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{detailsModal.studentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="info-section">
                <h3>
                  <FiBook className="section-icon" />
                  Education Details
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">College Name</span>
                    <span className="info-value">{detailsModal.collegeName || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Course</span>
                    <span className="info-value">{detailsModal.course || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Branch</span>
                    <span className="info-value">{detailsModal.branch || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Year of Study</span>
                    <span className="info-value">{detailsModal.yearOfStudy ? `${detailsModal.yearOfStudy} Year` : 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">CGPA</span>
                    <span className="info-value">{detailsModal.cgpa || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              {detailsModal.skills && (
                <div className="info-section">
                  <h3>
                    <FiCode className="section-icon" />
                    Technical Skills
                  </h3>
                  <div className="skills-container">
                    {detailsModal.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="skill-badge">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Internship Applied For */}
              <div className="info-section">
                <h3>
                  <FiBriefcase className="section-icon" />
                  Internship Applied For
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Position</span>
                    <span className="info-value">{detailsModal.internshipTitle || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{detailsModal.internshipLocation || 'Remote'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Stipend</span>
                    <span className="info-value">
                      <FiDollarSign className="inline-icon" /> {formatStipend(detailsModal.stipend)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{detailsModal.internshipDuration || '3 months'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Work Type</span>
                    <span className="info-value">{detailsModal.internshipType || 'Online'}</span>
                  </div>
                </div>
              </div>

              {/* Why Hire You */}
              {detailsModal.whyHireYou && (
                <div className="info-section">
                  <h3>
                    <FiMessageSquare className="section-icon" />
                    Why should we hire you?
                  </h3>
                  <p className="text-content">{detailsModal.whyHireYou}</p>
                </div>
              )}

              {/* Cover Letter */}
              {detailsModal.coverLetter && (
                <div className="info-section">
                  <h3>
                    <FiFile className="section-icon" />
                    Cover Letter
                  </h3>
                  <p className="text-content">{detailsModal.coverLetter}</p>
                </div>
              )}

              {/* Projects */}
              {detailsModal.projects && (
                <div className="info-section">
                  <h3>Projects</h3>
                  <p className="text-content">{detailsModal.projects}</p>
                </div>
              )}

              {/* Achievements */}
              {detailsModal.achievements && (
                <div className="info-section">
                  <h3>
                    <FiAward className="section-icon" />
                    Achievements
                  </h3>
                  <p className="text-content">{detailsModal.achievements}</p>
                </div>
              )}

              {/* Application Meta */}
              <div className="info-section">
                <h3>Application Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Applied On</span>
                    <span className="info-value">{detailsModal.appliedAt ? new Date(detailsModal.appliedAt).toLocaleString() : 'N/A'}</span>
                  </div>
                  {detailsModal.reviewedAt && (
                    <div className="info-item">
                      <span className="info-label">Reviewed On</span>
                      <span className="info-value">{new Date(detailsModal.reviewedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {detailsModal.reviewComments && (
                    <div className="info-item full-width">
                      <span className="info-label">Review Comments</span>
                      <span className="info-value review-text">{detailsModal.reviewComments}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Download */}
              {(detailsModal.resumePath || detailsModal.resumeFilename) && (
                <div className="resume-section">
                  <button 
                    className="download-resume-btn"
                    onClick={() => handleDownloadResume(detailsModal.resumePath, detailsModal.resumeFilename)}
                  >
                    <FiDownload /> Download Resume
                  </button>
                </div>
              )}
            </div>

            <div className="details-modal-footer">
              {detailsModal.status === 'PENDING' && (
                <button 
                  className="review-action-btn"
                  onClick={() => {
                    setDetailsModal(null);
                    openReviewModal(detailsModal);
                  }}
                >
                  Review Application
                </button>
              )}
              <button className="close-action-btn" onClick={() => setDetailsModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal - Only Accept and Reject Options */}
      {reviewModal && (
        <div className="review-modal">
          <div className="modal-content">
            <button 
              className="review-modal-close"
              onClick={() => {
                setReviewModal(null);
                setReviewData({ status: '', reviewComments: '' });
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: '#f8fafc',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1.2rem',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <FiX />
            </button>
            <h2>Review Application</h2>
            <p className="modal-subtitle">
              Reviewing {reviewModal.studentName} for {reviewModal.internshipTitle}
            </p>

            <div className="modal-form">
              <div className="form-group">
                <label>Decision *</label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select decision</option>
                  <option value="ACCEPTED">✅ Accept</option>
                  <option value="REJECTED">❌ Reject</option>
                </select>
              </div>

              <div className="form-group">
                <label>Comments (Optional)</label>
                <textarea
                  rows="3"
                  value={reviewData.reviewComments}
                  onChange={(e) => setReviewData({...reviewData, reviewComments: e.target.value})}
                  placeholder="Add your comments here..."
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    width: '100%',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setReviewModal(null);
                    setReviewData({ status: '', reviewComments: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#64748b'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="submit-btn"
                  onClick={() => handleReview(reviewModal.id)}
                  disabled={!reviewData.status}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#1e5a8a',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    opacity: !reviewData.status ? 0.6 : 1,
                    cursor: !reviewData.status ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (reviewData.status) {
                      e.currentTarget.style.background = '#0a3a5a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (reviewData.status) {
                      e.currentTarget.style.background = '#1e5a8a';
                    }
                  }}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyApplications;