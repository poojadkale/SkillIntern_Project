import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

import companyService from '../../services/companyService';
import InternshipForm from './InternshipForm';
import { 
  FiPlus, 
  FiBriefcase, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiCalendar, 
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalInternship, setModalInternship] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0
  });
  const [companyProfile, setCompanyProfile] = useState(null);

  useEffect(() => {
    fetchInternships();
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const data = await companyService.getCompanyProfile(user.id);
      setCompanyProfile(data);
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching internships for user:', user.id);
      
      const data = await companyService.getCompanyInternships(user.id);
      console.log('✅ Internships received:', data);
      
      setInternships(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const open = data?.filter(i => i.status === 'OPEN').length || 0;
      const closed = data?.filter(i => i.status === 'CLOSED').length || 0;
      
      setStats({ total, open, closed });
    } catch (error) {
      console.error('❌ Error fetching internships:', error);
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternship = async (id, internshipData) => {
    console.log('🔍 handleAddInternship called with:', { id, internshipData });
    
    if (!internshipData) {
      console.error('❌ internshipData is undefined');
      toast.error('Form data is missing. Please try again.');
      return;
    }
    
    try {
      console.log('📝 Adding internship with data:', internshipData);
      
      await companyService.addInternship(user.id, internshipData);
      toast.success('Internship posted successfully!');
      await fetchInternships();
      setShowForm(false);
    } catch (error) {
      console.error('❌ Error adding internship:', error);
      toast.error(error.response?.data?.message || 'Failed to post internship');
    }
  };

  const handleUpdateInternship = async (id, internshipData) => {
    console.log('🔍 handleUpdateInternship called with:', { id, internshipData });
    
    if (!id) {
      console.error('❌ Internship ID is missing');
      toast.error('Internship ID is missing');
      return;
    }
    
    if (!internshipData) {
      console.error('❌ internshipData is undefined');
      toast.error('Form data is missing');
      return;
    }
    
    try {
      console.log('📝 Updating internship ID:', id);
      console.log('📝 Update data:', internshipData);
      
      await companyService.updateInternship(id, internshipData);
      toast.success('Internship updated successfully!');
      await fetchInternships();
      setEditingInternship(null);
      setShowForm(false);
    } catch (error) {
      console.error('❌ Error updating internship:', error);
      toast.error(error.response?.data?.message || 'Failed to update internship');
    }
  };

  const handleDeleteInternship = async (id) => {
    try {
      console.log('🔍 Checking if internship can be deleted, ID:', id);
      
      // First, check if there are any applications for this internship
      let applications = [];
      try {
        applications = await companyService.getInternshipApplications(id) || [];
        console.log('📋 Found applications:', applications.length);
      } catch (appError) {
        console.log('No applications found or error fetching applications');
      }
      
      if (applications.length > 0) {
        // Check if any applications are pending or reviewed
        const hasPendingOrReviewed = applications.some(app => 
          app.status === 'PENDING' || app.status === 'REVIEWED'
        );
        
        if (hasPendingOrReviewed) {
          toast.error('Cannot delete internship with pending or reviewed applications');
          return;
        }
        
        // Show warning about deleting with existing applications
        const confirmMessage = `This internship has ${applications.length} completed applications (shortlisted/accepted/rejected). These will also be deleted. Are you sure?`;
        
        if (!window.confirm(confirmMessage)) {
          return;
        }
      } else {
        // No applications, simple confirmation
        if (!window.confirm('Are you sure you want to delete this internship?')) {
          return;
        }
      }
      
      // Proceed with deletion
      await companyService.deleteInternship(id);
      toast.success('Internship deleted successfully');
      await fetchInternships();
      
    } catch (error) {
      console.error('❌ Error deleting internship:', error);
      
      // Check if it's a foreign key constraint error
      const errorMsg = error.response?.data?.message || '';
      if (errorMsg.includes('foreign key constraint') || errorMsg.includes('Cannot delete')) {
        toast.error('This internship has existing applications and cannot be deleted');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete internship');
      }
    }
  };

  const handleEditClick = (internship) => {
    console.log('🔍 Editing internship:', internship);
    setEditingInternship(internship);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingInternship(null);
  };

  const handleShowDetails = (internship) => {
    setModalInternship(internship);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setModalInternship(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Update work type
  const handleUpdateWorkType = async (internshipId, newWorkType) => {
    try {
      const internshipToUpdate = internships.find(i => i.id === internshipId);
      if (internshipToUpdate) {
        const updatedData = { ...internshipToUpdate, type: newWorkType };
        await companyService.updateInternship(internshipId, updatedData);
        toast.success('Work type updated successfully');
        await fetchInternships();
        
        // Update modal if open
        if (modalInternship && modalInternship.id === internshipId) {
          setModalInternship({ ...modalInternship, type: newWorkType });
        }
      }
    } catch (error) {
      console.error('Error updating work type:', error);
      toast.error('Failed to update work type');
    }
  };

  // Update status
  const handleUpdateStatus = async (internshipId, newStatus) => {
    try {
      const internshipToUpdate = internships.find(i => i.id === internshipId);
      if (internshipToUpdate) {
        const updatedData = { ...internshipToUpdate, status: newStatus };
        await companyService.updateInternship(internshipId, updatedData);
        toast.success('Status updated successfully');
        await fetchInternships();
        
        // Update modal if open
        if (modalInternship && modalInternship.id === internshipId) {
          setModalInternship({ ...modalInternship, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Get display name (company name from profile, fallback to user's fullName)
  const getDisplayName = () => {
    if (companyProfile?.companyName) {
      return companyProfile.companyName;
    }
    return user?.fullName || 'User';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Welcome, {getDisplayName()}!</h1>
          <p className="welcome-subtitle">Manage your internship postings</p>
        </div>
        
        {/* Post Internship Button */}
        <button 
          className="post-internship-btn"
          onClick={() => {
            setEditingInternship(null);
            setShowForm(true);
          }}
        >
          <FiPlus /> Post New Internship
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiBriefcase />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Internships</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon open">
            <FiBriefcase />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.open}</span>
            <span className="stat-label">Open Internships</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon closed">
            <FiBriefcase />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.closed}</span>
            <span className="stat-label">Closed Internships</span>
          </div>
        </div>
      </div>

      {/* Internship Form Modal */}
      {showForm && (
        <div className="form-modal-overlay">
          <div className="form-modal">
            <InternshipForm
              internship={editingInternship}
              onSubmit={editingInternship ? handleUpdateInternship : handleAddInternship}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {/* Internships Section */}
      <div className="internships-section">
        <div className="section-header">
          <h2 className="section-title">Your Internships</h2>
          {internships.length > 0 && (
            <span className="internship-count">{internships.length} total</span>
          )}
        </div>

        {internships.length === 0 ? (
          <div className="empty-state">
            <FiBriefcase className="empty-icon" />
            <h3>No internships yet</h3>
            <p>Get started by posting your first internship opportunity.</p>
            <button 
              className="post-internship-btn empty"
              onClick={() => {
                setEditingInternship(null);
                setShowForm(true);
              }}
            >
              <FiPlus /> Post Your First Internship
            </button>
          </div>
        ) : (
          <div className="internships-grid">
            {internships.map((internship) => (
              <div key={internship.id} className={`internship-card ${internship.status === 'CLOSED' ? 'closed' : ''}`}>
                {/* Card Header */}
                <div className="card-header">
                  <h3 className="card-title">{internship.title}</h3>
                  <select
                    value={internship.status || 'OPEN'}
                    onChange={(e) => handleUpdateStatus(internship.id, e.target.value)}
                    className={`status-select ${internship.status === 'OPEN' ? 'status-open' : 'status-closed'}`}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* Company */}
                <div className="company-info">
                  <FiBriefcase className="company-icon" />
                  <span>{internship.company?.companyName || companyProfile?.companyName || 'Your Company'}</span>
                </div>

                {/* Basic Details */}
                <div className="details-section">
                  <div className="detail-item">
                    <FiMapPin className="detail-icon" />
                    <span><strong>Location:</strong> {internship.location || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <FiClock className="detail-icon" />
                    <span><strong>Duration:</strong> {internship.duration || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <FiDollarSign className="detail-icon" />
                    <span><strong>Stipend:</strong> ₹{internship.stipend}/month</span>
                  </div>
                </div>

                {/* Work Type Dropdown */}
                <div className="openings-section">
                  <FiUsers className="openings-icon" />
                  <span><strong>Work Type:</strong></span>
                  <select
                    value={internship.type || 'Online'}
                    onChange={(e) => handleUpdateWorkType(internship.id, e.target.value)}
                    className="work-type-select"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Openings */}
                <div className="openings-section">
                  <FiUsers className="openings-icon" />
                  <span><strong>Openings:</strong> {internship.numberOfOpenings || 0}</span>
                </div>

                {/* Application End Date */}
                <div className="date-section">
                  <FiCalendar className="date-icon" />
                  <span><strong>Applications end:</strong> {formatDate(internship.endDate)}</span>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => handleShowDetails(internship)}
                  >
                    <FiEye /> View
                  </button>
                  
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditClick(internship)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteInternship(internship.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal with Inline CSS Close Button */}
      {showDetailsModal && modalInternship && (
        <div className="details-modal-overlay" onClick={handleCloseModal}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            {/* Close Button - Much Larger and More Visible */}
            <button 
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                border: 'none',
                background: '#1e5a8a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '24px',
                fontWeight: 'bold',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1e5a8a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h2 className="modal-title">{modalInternship.title}</h2>
              <div className="modal-company">
                <FiBriefcase className="modal-company-icon" />
                <span>{modalInternship.company?.companyName || companyProfile?.companyName || 'Your Company'}</span>
              </div>
            </div>

            <div className="modal-body">
              {/* Key Details Grid */}
              <div className="modal-details-grid">
                <div className="modal-detail-card">
                  <FiMapPin className="modal-detail-icon" />
                  <div className="modal-detail-content">
                    <span className="modal-detail-label">Location</span>
                    <span className="modal-detail-value">{modalInternship.location || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="modal-detail-card">
                  <FiClock className="modal-detail-icon" />
                  <div className="modal-detail-content">
                    <span className="modal-detail-label">Duration</span>
                    <span className="modal-detail-value">{modalInternship.duration || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="modal-detail-card">
                  <FiDollarSign className="modal-detail-icon" />
                  <div className="modal-detail-content">
                    <span className="modal-detail-label">Stipend</span>
                    <span className="modal-detail-value">₹{modalInternship.stipend}/month</span>
                  </div>
                </div>
                
                <div className="modal-detail-card">
                  <FiUsers className="modal-detail-icon" />
                  <div className="modal-detail-content">
                    <span className="modal-detail-label">Openings</span>
                    <span className="modal-detail-value">{modalInternship.numberOfOpenings || 0}</span>
                  </div>
                </div>
                
                <div className="modal-detail-card">
                  <FiBriefcase className="modal-detail-icon" />
                  <div className="modal-detail-content">
                    <span className="modal-detail-label">Work Type</span>
                    <select
                      value={modalInternship.type || 'Online'}
                      onChange={(e) => handleUpdateWorkType(modalInternship.id, e.target.value)}
                      className="modal-work-type-select"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-detail-card">
                  <FiCalendar className="modal-detail-icon" />
                  <div className="modal-detail-content">
                    <span className="modal-detail-label">Apply By</span>
                    <span className="modal-detail-value">{formatDate(modalInternship.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {modalInternship.description && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Description</h3>
                  <p className="modal-description">{modalInternship.description}</p>
                </div>
              )}

              {/* Required Skills */}
              {modalInternship.requiredSkills && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Required Skills</h3>
                  <div className="modal-skills">
                    {modalInternship.requiredSkills?.split(',').map((skill, idx) => (
                      <span key={idx} className="modal-skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="modal-section">
                <h3 className="modal-section-title">Additional Information</h3>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <span className="modal-info-label">Posted on:</span>
                    <span className="modal-info-value">{formatDate(modalInternship.postedAt)}</span>
                  </div>
                  {modalInternship.startDate && (
                    <div className="modal-info-item">
                      <span className="modal-info-label">Applications start:</span>
                      <span className="modal-info-value">{formatDate(modalInternship.startDate)}</span>
                    </div>
                  )}
                  <div className="modal-info-item">
                    <span className="modal-info-label">Status:</span>
                    <select
                      value={modalInternship.status || 'OPEN'}
                      onChange={(e) => handleUpdateStatus(modalInternship.id, e.target.value)}
                      className={`modal-status-select ${modalInternship.status === 'OPEN' ? 'status-open' : 'status-closed'}`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-close-footer-btn" onClick={handleCloseModal}>
                Close
              </button>
              <button 
                className="modal-edit-btn"
                onClick={() => {
                  handleCloseModal();
                  handleEditClick(modalInternship);
                }}
              >
                <FiEdit2 /> Edit Internship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;