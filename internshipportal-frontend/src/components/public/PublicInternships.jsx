import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiSearch, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiBriefcase, 
  FiArrowRight, 
  FiCalendar,
  FiExternalLink,
  FiX
} from 'react-icons/fi';
import companyService from '../../services/companyService';
import './PublicInternships.css';

const PublicInternships = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';
  
  const [internships, setInternships] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalInternship, setModalInternship] = useState(null);

  // Set initial search term when component mounts
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    loadInternships();
  }, []);

  useEffect(() => {
    filterInternships();
  }, [searchTerm, internships]);

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getAllOpenInternships();
      console.log('Internships loaded:', data);
      
      if (data && data.length > 0) {
        console.log('Sample internship structure:', data[0]);
      }
      
      setInternships(data || []);
      setFiltered(data || []);
    } catch (error) {
      console.error('Error loading internships:', error);
      setError('Failed to load internships. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterInternships = () => {
    if (!searchTerm.trim()) {
      setFiltered(internships);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filteredData = internships.filter(internship =>
      internship.title?.toLowerCase().includes(term) ||
      getCompanyName(internship).toLowerCase().includes(term) ||
      internship.description?.toLowerCase().includes(term) ||
      internship.requiredSkills?.toLowerCase().includes(term) ||
      internship.location?.toLowerCase().includes(term)
    );
    setFiltered(filteredData);
  };

  const clearSearch = () => {
    setSearchTerm('');
    // Optionally update URL when clearing search
    // navigate('/internships', { replace: true });
  };

  const formatStipend = (stipend) => {
    if (!stipend) return 'Not specified';
    if (stipend === 'Unpaid' || stipend === '0') return 'Unpaid';
    return `₹${stipend}/month`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getCompanyName = (internship) => {
    if (internship.companyName) return internship.companyName;
    if (internship.company?.name) return internship.company.name;
    if (internship.company?.companyName) return internship.company.companyName;
    if (internship.companyId && internship.companyDetails?.companyName) return internship.companyDetails.companyName;
    if (internship.employer?.name) return internship.employer.name;
    if (internship.employer?.companyName) return internship.employer.companyName;
    return 'Company';
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

  const handleShowDetails = (internship) => {
    setModalInternship(internship);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setModalInternship(null);
  };

  if (loading) {
    return (
      <div className="public-internships-loading">
        <div className="spinner"></div>
        <p>Loading internships...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-internships-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={loadInternships} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="public-internships-page">
      {/* Hero Section */}
      <div className="public-internships-hero">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Dream Internship</h1>
          <p className="hero-subtitle">Discover thousands of opportunities from top companies</p>
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
          {searchTerm && (
            <button className="clear-search-btn" onClick={clearSearch}>
              ✕
            </button>
          )}
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
          <p>No internships match your search criteria.</p>
          {searchTerm && (
            <button className="clear-btn" onClick={clearSearch}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="internships-grid">
          {filtered.map((internship) => {
            const companyName = getCompanyName(internship);
            const deadlineNear = isDeadlineNear(internship.endDate) && !isDeadlinePassed(internship.endDate);
            const deadlinePassed = isDeadlinePassed(internship.endDate);
            
            return (
              <div key={internship.id} className={`internship-card ${deadlinePassed ? 'expired' : ''}`}>
                {/* Card Title */}
                <h3 className="card-title">{internship.title}</h3>

                {/* Company */}
                <div className="company-info">
                  <FiBriefcase className="company-icon" />
                  <span>{companyName}</span>
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
                    <span><strong>Stipend:</strong> {formatStipend(internship.stipend)}</span>
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

                {/* Skills Section */}
                {internship.requiredSkills && (
                  <div className="skills-section">
                    <div className="skills-list">
                      {internship.requiredSkills.split(',').slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill.trim()}</span>
                      ))}
                      {internship.requiredSkills.split(',').length > 3 && (
                        <span className="skill-tag more">
                          +{internship.requiredSkills.split(',').length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Show Details Button */}
                <button 
                  className="show-details-btn"
                  onClick={() => handleShowDetails(internship)}
                >
                  <FiExternalLink /> Show Details
                </button>

                {/* Apply Button */}
                <button 
                  className={`apply-btn ${deadlinePassed ? 'disabled' : ''}`}
                  onClick={() => !deadlinePassed && navigate('/login')}
                  disabled={deadlinePassed}
                >
                  {deadlinePassed ? 'Applications Closed' : 'Login to Apply'}
                  {!deadlinePassed && <FiArrowRight className="btn-icon" />}
                </button>
              </div>
            );
          })}
        </div>
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
                    <span className="modal-detail-value">{formatStipend(modalInternship.stipend)}</span>
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
              {!isDeadlinePassed(modalInternship.endDate) && (
                <button 
                  className="modal-apply-btn"
                  onClick={() => {
                    handleCloseModal();
                    navigate('/login');
                  }}
                >
                  Login to Apply <FiArrowRight />
                </button>
              )}
              {isDeadlinePassed(modalInternship.endDate) && (
                <button className="modal-expired-btn" disabled>
                  Applications Closed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicInternships;