import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import companyService from '../../services/companyService';
import ApplicationForm from './ApplicationForm';
import { 
  FiSearch, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiArrowLeft,
  FiBriefcase,
  FiSend,
  FiCheckCircle,
  FiCalendar,
  FiUsers,
  FiChevronDown,
  FiX,
  FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './StudentInternships.css';

const StudentInternships = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('company');
  
  const [internships, setInternships] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [allInternships, setAllInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [appliedInternships, setAppliedInternships] = useState(new Set());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalInternship, setModalInternship] = useState(null);
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    loadAllInternships();
    loadAppliedInternships();
    loadApplicationStats();
  }, []);

  useEffect(() => {
    if (companyId && allInternships.length > 0) {
      filterByCompany();
    }
  }, [companyId, allInternships]);

  useEffect(() => {
    filterInternships();
  }, [searchTerm, internships]);

  const loadAppliedInternships = async () => {
    try {
      console.log('📡 Loading applied internships for user:', user?.id);
      const applications = await companyService.getStudentApplications(user.id);
      console.log('✅ Applications loaded:', applications);
      
      const appliedIds = new Set(applications.map(app => 
        app.internshipId || app.internship_id || app.internship?.id
      ));
      
      console.log('Applied internship IDs:', Array.from(appliedIds));
      setAppliedInternships(appliedIds);
    } catch (error) {
      console.error('❌ Error loading applied internships:', error);
    }
  };

  const loadApplicationStats = async () => {
    try {
      const applications = await companyService.getStudentApplications(user.id);
      const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'PENDING').length,
        accepted: applications.filter(app => app.status === 'ACCEPTED').length,
        rejected: applications.filter(app => app.status === 'REJECTED').length
      };
      setApplicationStats(stats);
    } catch (error) {
      console.error('Error loading application stats:', error);
    }
  };

  const loadAllInternships = async () => {
    try {
      setLoading(true);
      console.log('📡 Loading all internships...');
      const data = await companyService.getAllOpenInternships();
      console.log('✅ All internships loaded:', data);
      setAllInternships(data || []);
      
      if (companyId) {
        filterByCompanyWithData(data || []);
      } else {
        setInternships(data || []);
        setFiltered(data || []);
      }
    } catch (error) {
      console.error('❌ Error loading internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCompanyWithData = (internshipsData) => {
    const companyInternships = internshipsData.filter(
      internship => {
        const id = internship.companyId || internship.company?.id || internship.company_id;
        return id === parseInt(companyId);
      }
    );
    
    if (companyInternships.length > 0) {
      const firstInternship = companyInternships[0];
      const name = firstInternship.companyName || 
                   firstInternship.company?.companyName || 
                   firstInternship.company_name ||
                   'Company';
      setCompanyName(name);
    } else {
      getCompanyNameFromCompanies();
    }
    
    setInternships(companyInternships);
    setFiltered(companyInternships);
  };

  const filterByCompany = () => {
    filterByCompanyWithData(allInternships);
  };

  const getCompanyNameFromCompanies = async () => {
    try {
      const companies = await companyService.getTopCompanies();
      const company = companies.find(c => c.id === parseInt(companyId));
      if (company) {
        setCompanyName(company.companyName);
      }
    } catch (error) {
      console.error('Error getting company name:', error);
    }
  };

  const filterInternships = () => {
    if (!searchTerm.trim()) {
      setFiltered(internships);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = internships.filter(internship =>
      internship.title?.toLowerCase().includes(term) ||
      internship.requiredSkills?.toLowerCase().includes(term) ||
      internship.location?.toLowerCase().includes(term)
    );
    setFiltered(filtered);
  };

  const handleApplyClick = (internship) => {
    if (appliedInternships.has(internship.id)) {
      toast.error('You have already applied for this internship');
      return;
    }
    
    if (isDeadlinePassed(internship.endDate)) {
      toast.error('Application deadline has passed');
      return;
    }
    
    setSelectedInternship(internship);
    setShowApplicationForm(true);
  };

  const handleApplicationClose = () => {
    setShowApplicationForm(false);
    setSelectedInternship(null);
  };

  const handleApplicationSuccess = () => {
    loadAllInternships();
    loadAppliedInternships();
    loadApplicationStats();
  };

  // NEW: Handle showing details modal
  const handleShowDetails = (internship) => {
    setModalInternship(internship);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setModalInternship(null);
  };

  const getCompanyName = (internship) => {
    return internship.companyName || 
           internship.company?.companyName || 
           internship.company_name ||
           'Company';
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const isDeadlineNear = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isDeadlinePassed = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const deadline = new Date(endDate);
    return deadline < today;
  };

  if (loading) {
    return (
      <>
       
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading internships...</p>
        </div>
      </>
    );
  }

  return (
    <>
     
      <div className="internships-page">
        {/* Header */}
        <div className="page-header">
          <Link to={companyId ? "/student/companies" : "/student/dashboard"} className="back-link">
            <FiArrowLeft /> {companyId ? 'Back to Companies' : 'Back to Dashboard'}
          </Link>
          <h1 className="page-title">
            {companyName ? `${companyName} Internships` : 'Available Internships'}
          </h1>
          <p className="page-subtitle">
            {companyName 
              ? `Explore internships at ${companyName}` 
              : 'Find your perfect internship opportunity'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon total">
              <FiBriefcase />
            </div>
            <div className="stat-content">
              <span className="stat-value">{applicationStats.total}</span>
              <span className="stat-label">Total Applied</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <FiClock />
            </div>
            <div className="stat-content">
              <span className="stat-value">{applicationStats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon accepted">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-value">{applicationStats.accepted}</span>
              <span className="stat-label">Accepted</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-value">{applicationStats.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, skills, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="internships-count">
            <FiBriefcase className="count-icon" />
            <span className="count-number">{filtered.length}</span> 
            {filtered.length === 1 ? 'internship' : 'internships'} available
          </div>
        </div>

        {/* Internships Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FiBriefcase className="empty-icon" />
            <h3>No internships found</h3>
            <p>
              {companyName 
                ? `${companyName} hasn't posted any internships yet.` 
                : 'No internships match your search criteria.'}
            </p>
            {companyName && (
              <Link to="/student/internships" className="clear-btn">
                View All Internships
              </Link>
            )}
            {!companyName && (
              <button className="clear-btn" onClick={clearSearch}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="internships-grid">
            {filtered.map((internship) => {
              const isApplied = appliedInternships.has(internship.id);
              const deadlineNear = isDeadlineNear(internship.endDate) && !isDeadlinePassed(internship.endDate);
              const deadlinePassed = isDeadlinePassed(internship.endDate);
              
              return (
                <div key={internship.id} className={`internship-card ${isApplied ? 'applied' : ''}`}>
                  {/* Header with Title */}
                  <h3 className="card-title">{internship.title}</h3>

                  {/* Company */}
                  <div className="company-info">
                    <FiBriefcase className="company-icon" />
                    <span>{getCompanyName(internship)}</span>
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

                  {/* Application End Date */}
                  <div className="date-section">
                    <div className="date-label">APPLICATIONS END</div>
                    <div className="date-value">
                      <FiCalendar className="date-icon" />
                      <span>{formatDate(internship.endDate)}</span>
                      {deadlineNear && !deadlinePassed && (
                        <span className="deadline-badge">Closing Soon</span>
                      )}
                      {deadlinePassed && (
                        <span className="deadline-badge passed">Expired</span>
                      )}
                    </div>
                  </div>

                  {/* Show Details Button - Opens Modal */}
                  <button 
                    className="show-details-btn"
                    onClick={() => handleShowDetails(internship)}
                  >
                    <FiExternalLink /> Show Details
                  </button>

                  {/* Apply Button */}
                  <button 
                    className={`apply-btn ${isApplied ? 'applied' : ''} ${deadlinePassed ? 'disabled' : ''}`}
                    onClick={() => handleApplyClick(internship)}
                    disabled={isApplied || deadlinePassed}
                  >
                    {isApplied ? (
                      '✓ Already Applied'
                    ) : deadlinePassed ? (
                      'Applications Closed'
                    ) : (
                      <>Apply Now <FiSend /></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Application Form Modal */}
        {showApplicationForm && selectedInternship && (
          <ApplicationForm
            internship={selectedInternship}
            onClose={handleApplicationClose}
            onSuccess={handleApplicationSuccess}
          />
        )}

        {/* Details Modal */}
        {showDetailsModal && modalInternship && (
          <div className="details-modal-overlay" onClick={handleCloseModal}>
            <div className="details-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
              
              <div className="modal-header">
                <h2 className="modal-title">{modalInternship.title}</h2>
                <div className="modal-company">
                  <FiBriefcase className="modal-company-icon" />
                  <span>{getCompanyName(modalInternship)}</span>
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
                      <span className="modal-detail-value work-type-badge">{modalInternship.type || 'Online'}</span>
                    </div>
                  </div>
                  
                  <div className="modal-detail-card">
                    <FiCalendar className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <span className="modal-detail-label">Apply By</span>
                      <span className="modal-detail-value deadline-value">
                        {formatDate(modalInternship.endDate)}
                        {isDeadlineNear(modalInternship.endDate) && !isDeadlinePassed(modalInternship.endDate) && (
                          <span className="deadline-badge modal-deadline">Closing Soon</span>
                        )}
                        {isDeadlinePassed(modalInternship.endDate) && (
                          <span className="deadline-badge passed modal-deadline">Expired</span>
                        )}
                      </span>
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
                      <span className={`modal-status-badge ${modalInternship.status === 'OPEN' ? 'status-open' : 'status-closed'}`}>
                        {modalInternship.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="modal-close-footer-btn" onClick={handleCloseModal}>
                  Close
                </button>
                {!appliedInternships.has(modalInternship.id) && !isDeadlinePassed(modalInternship.endDate) && (
                  <button 
                    className="modal-apply-btn"
                    onClick={() => {
                      handleCloseModal();
                      handleApplyClick(modalInternship);
                    }}
                  >
                    Apply Now <FiSend />
                  </button>
                )}
                {appliedInternships.has(modalInternship.id) && (
                  <button className="modal-applied-btn" disabled>
                    <FiCheckCircle /> Already Applied
                  </button>
                )}
                {isDeadlinePassed(modalInternship.endDate) && !appliedInternships.has(modalInternship.id) && (
                  <button className="modal-expired-btn" disabled>
                    Applications Closed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentInternships;