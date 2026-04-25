import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { FiEye, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ApplicationsManagement.css';

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllApplications();
      console.log('Applications data:', data);
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      (app.fullName || app.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.internship?.title || app.internshipTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.internship?.company?.companyName || app.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusDisplay = (status) => {
    const statusUpper = (status || '').toUpperCase();
    
    switch(statusUpper) {
      case 'PENDING':
        return { icon: '⏳', text: 'Pending', class: 'status-pending' };
      case 'REVIEWED':
        return { icon: '👁️', text: 'Reviewed', class: 'status-reviewed' };
      case 'SHORTLISTED':
        return { icon: '⭐', text: 'Shortlisted', class: 'status-shortlisted' };
      case 'ACCEPTED':
      case 'APPROVED':
        return { icon: '✓', text: 'Approved', class: 'status-approved' };
      case 'REJECTED':
        return { icon: '✗', text: 'Rejected', class: 'status-rejected' };
      default:
        return { icon: '⏳', text: status || 'Pending', class: 'status-pending' };
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => (a.status || '').toUpperCase() === 'PENDING').length,
    reviewed: applications.filter(a => (a.status || '').toUpperCase() === 'REVIEWED').length,
    shortlisted: applications.filter(a => (a.status || '').toUpperCase() === 'SHORTLISTED').length,
    accepted: applications.filter(a => (a.status || '').toUpperCase() === 'ACCEPTED' || (a.status || '').toUpperCase() === 'APPROVED').length,
    rejected: applications.filter(a => (a.status || '').toUpperCase() === 'REJECTED').length
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
    <div className="applications-management">
      <div className="page-header">
        <div>
          <h2>Applications Management</h2>
          <p className="subtitle">View and track all internship applications</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">Total: {stats.total}</div>
          <div className="stat-badge">Pending: {stats.pending}</div>
          <div className="stat-badge">Reviewed: {stats.reviewed}</div>
          <div className="stat-badge">Shortlisted: {stats.shortlisted}</div>
          <div className="stat-badge">Approved: {stats.accepted}</div>
          <div className="stat-badge">Rejected: {stats.rejected}</div>
        </div>
      </div>
      
      <div className="filter-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by student name, email, internship, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({stats.total})
          </button>
          <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
            Pending ({stats.pending})
          </button>
          <button className={`filter-btn ${filter === 'reviewed' ? 'active' : ''}`} onClick={() => setFilter('reviewed')}>
            Reviewed ({stats.reviewed})
          </button>
          <button className={`filter-btn ${filter === 'shortlisted' ? 'active' : ''}`} onClick={() => setFilter('shortlisted')}>
            Shortlisted ({stats.shortlisted})
          </button>
          <button className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>
            Approved ({stats.accepted})
          </button>
          <button className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      <div className="applications-table-container">
        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No applications found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Internship</th>
                <th>Company</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
               </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => {
                const statusDisplay = getStatusDisplay(app.status);
                return (
                  <tr key={app.id}>
                    <td className="id-cell">{app.id}</td>
                    <td>
                      <div>
                        <strong>{app.fullName || app.studentName || 'N/A'}</strong>
                        <br />
                        <small style={{ color: '#5a6e85' }}>{app.email || 'No email'}</small>
                      </div>
                    </td>
                    <td>
                      <strong>{app.internship?.title || app.internshipTitle || 'N/A'}</strong>
                    </td>
                    <td>
                      {app.internship?.company?.companyName || app.companyName || 'N/A'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#5a6e85' }}>
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td>
                      <span className={`status-simple ${statusDisplay.class}`}>
                        <span className="status-simple-icon">{statusDisplay.icon}</span>
                        {statusDisplay.text}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="view-simple-btn"
                        onClick={() => handleViewDetails(app)}
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>Student Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name</span>
                    <span className="info-value">{selectedApplication.fullName || selectedApplication.studentName || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedApplication.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedApplication.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">College</span>
                    <span className="info-value">{selectedApplication.collegeName || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Course</span>
                    <span className="info-value">{selectedApplication.course || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">CGPA</span>
                    <span className="info-value">{selectedApplication.cgpa || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Internship Details</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Position</span>
                    <span className="info-value">{selectedApplication.internship?.title || selectedApplication.internshipTitle || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Company</span>
                    <span className="info-value">{selectedApplication.internship?.company?.companyName || selectedApplication.companyName || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{selectedApplication.internship?.location || 'Remote'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Stipend</span>
                    <span className="info-value">
                      {selectedApplication.internship?.stipend ? `₹${selectedApplication.internship.stipend}/month` : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedApplication.whyHireYou && (
                <div className="modal-section">
                  <h4>Why Hire This Candidate?</h4>
                  <p className="modal-description">{selectedApplication.whyHireYou}</p>
                </div>
              )}

              {selectedApplication.skills && (
                <div className="modal-section">
                  <h4>Skills</h4>
                  <div className="skills-list">
                    {selectedApplication.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-section">
                <h4>Application Status</h4>
                {(() => {
                  const statusDisplay = getStatusDisplay(selectedApplication.status);
                  return (
                    <span className={`status-simple ${statusDisplay.class}`}>
                      <span className="status-simple-icon">{statusDisplay.icon}</span>
                      {statusDisplay.text}
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagement;