import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiBriefcase, FiUsers, FiArrowRight, FiClock, FiDollarSign, FiX, FiExternalLink, FiCalendar, FiSend } from 'react-icons/fi';
import companyService from '../../services/companyService';
import './PublicCompanies.css';

const PublicCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyInternships, setCompanyInternships] = useState([]);
  const [loadingInternships, setLoadingInternships] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalInternship, setModalInternship] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await companyService.getTopCompanies();
      console.log('All companies from API:', data);
      
      const approvedCompanies = data.filter(company => {
        if (company.companyName && company.id) {
          console.log(`✓ Showing company: ${company.companyName}`);
          return true;
        }
        return false;
      });
      
      console.log(`✅ Companies to display: ${approvedCompanies.length}`);
      setCompanies(approvedCompanies || []);
      setFiltered(approvedCompanies || []);
      
    } catch (error) {
      console.error('Error loading companies:', error);
      setError('Failed to load companies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    if (!searchTerm.trim()) {
      setFiltered(companies);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filteredData = companies.filter(company =>
      company.companyName?.toLowerCase().includes(term) ||
      company.location?.toLowerCase().includes(term)
    );
    setFiltered(filteredData);
  };

  const handleViewInternships = async (company) => {
    setSelectedCompany(company);
    setLoadingInternships(true);
    try {
      const internships = await companyService.getInternshipsByCompanyId(company.id);
      
      const activeInternships = (internships || []).filter(internship => {
        return internship.status === 'OPEN';
      });
      
      setCompanyInternships(activeInternships);
    } catch (error) {
      console.error('Error loading internships:', error);
      setCompanyInternships([]);
    } finally {
      setLoadingInternships(false);
    }
  };

  const closeModal = () => {
    setSelectedCompany(null);
    setCompanyInternships([]);
    setShowDetailsModal(false);
    setModalInternship(null);
  };

  const handleShowDetails = (internship) => {
    setModalInternship(internship);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setModalInternship(null);
  };

  const handleApply = (internshipId) => {
    closeModal();
    navigate('/login', { state: { from: `/internships/${internshipId}` } });
  };

  const formatStipend = (stipend) => {
    if (!stipend) return 'Not specified';
    return `₹${stipend}/month`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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

  const getInitials = (name) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getColor = (name) => {
    const colors = [
      '#0a2540', '#1e5a8a', '#2c6e9e', '#3a7b9f',
      '#1e4a76', '#2c5f8a', '#0a3a5a', '#1e6a8a'
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="public-companies-loading">
        <div className="spinner"></div>
        <p>Loading companies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-companies-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={loadCompanies} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="public-companies-page">
      {/* Hero Section */}
      <div className="public-companies-hero">
        <div className="hero-content">
          <h1 className="hero-title">Top Hiring Companies</h1>
          <p className="hero-subtitle">Explore internship opportunities from India's leading companies</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search companies by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="companies-count">
          <FiUsers className="count-icon" />
          <span className="count-number">{filtered.length}</span> companies found
        </div>
      </div>

      {/* Companies Grid - Matching Student Companies Style */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <FiBriefcase className="empty-icon" />
          <h3>No companies found</h3>
          <p>Try adjusting your search criteria</p>
          <button className="clear-btn" onClick={() => setSearchTerm('')}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="companies-grid">
          {filtered.map((company) => (
            <div 
              key={company.id} 
              className="company-card clickable"
              onClick={() => handleViewInternships(company)}
            >
              <div className="company-card-inner">
                {/* Header Row with Logo and Badge */}
                <div className="company-header-row">
                  <div 
                    className="company-logo"
                    style={{ backgroundColor: getColor(company.companyName) }}
                  >
                    <span className="company-initials">{getInitials(company.companyName)}</span>
                  </div>
                  {company.internshipCount > 0 && (
                    <div className="hiring-badge">
                      <span className="hiring-dot"></span>
                      Hiring Now
                    </div>
                  )}
                </div>
                
                {/* Company Name */}
                <h3 className="company-name">{company.companyName}</h3>
                
                {/* Location */}
                <div className="company-location">
                  <FiMapPin className="location-icon" /> 
                  <span>{company.location || 'Location not specified'}</span>
                </div>
                
                {/* Description Preview */}
                <div className="company-description-preview">
                  <p>
                    {company.description 
                      ? (company.description.length > 120 
                          ? `${company.description.substring(0, 120)}...` 
                          : company.description)
                      : 'Leading company in the industry offering great internship opportunities for students.'}
                  </p>
                </div>
                
                {/* Footer */}
                <div className="card-footer">
                  <span className="view-link">
                    View Open Positions <FiArrowRight className="footer-icon" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Internships Modal */}
      {selectedCompany && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                <div 
                  className="modal-logo"
                  style={{ backgroundColor: getColor(selectedCompany.companyName) }}
                >
                  <span className="modal-initials">{getInitials(selectedCompany.companyName)}</span>
                </div>
                <div>
                  <h2>{selectedCompany.companyName}</h2>
                  <p className="modal-location">
                    <FiMapPin /> {selectedCompany.location || 'Location not specified'}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <h3>Available Internships</h3>
              
              {loadingInternships ? (
                <div className="modal-loading">
                  <div className="small-spinner"></div>
                  <p>Loading internships...</p>
                </div>
              ) : companyInternships.length > 0 ? (
                <div className="internships-modal-list">
                  {companyInternships.map((internship) => {
                    const deadlineNear = isDeadlineNear(internship.endDate) && !isDeadlinePassed(internship.endDate);
                    const deadlinePassed = isDeadlinePassed(internship.endDate);
                    
                    return (
                      <div key={internship.id} className="modal-internship-card">
                        <div className="modal-internship-header">
                          <h4 className="modal-internship-title">{internship.title}</h4>
                          <span className="modal-internship-type">{internship.type || 'Online'}</span>
                        </div>
                        
                        <div className="modal-internship-details">
                          <div className="modal-detail">
                            <FiMapPin className="modal-detail-icon" />
                            <span>{internship.location || 'Location not specified'}</span>
                          </div>
                          <div className="modal-detail">
                            <FiClock className="modal-detail-icon" />
                            <span>{internship.duration || 'Duration not specified'}</span>
                          </div>
                          <div className="modal-detail">
                            <FiDollarSign className="modal-detail-icon" />
                            <span>{formatStipend(internship.stipend)}</span>
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

                        {internship.description && (
                          <p className="modal-internship-description">
                            {internship.description.length > 100 
                              ? `${internship.description.substring(0, 100)}...` 
                              : internship.description}
                          </p>
                        )}

                        {internship.requiredSkills && (
                          <div className="modal-skills">
                            <div className="modal-skills-list">
                              {internship.requiredSkills.split(',').slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="modal-skill-tag">{skill.trim()}</span>
                              ))}
                              {internship.requiredSkills.split(',').length > 3 && (
                                <span className="modal-skill-tag more">+{internship.requiredSkills.split(',').length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}

                        <button 
                          className="show-details-btn"
                          onClick={() => handleShowDetails(internship)}
                        >
                          <FiExternalLink /> Show Details
                        </button>

                        <button 
                          className="modal-apply-btn"
                          onClick={() => handleApply(internship.id)}
                          disabled={deadlinePassed}
                        >
                          {deadlinePassed ? 'Applications Closed' : 'Login to Apply'}
                          {!deadlinePassed && <FiArrowRight />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="modal-no-internships">
                  <FiBriefcase className="no-internships-icon" />
                  <p>No active internships available at the moment.</p>
                  <p className="no-internships-subtext">Check back later for new opportunities!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal for Internship */}
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
                <span>{selectedCompany?.companyName || 'Company'}</span>
              </div>
            </div>

            <div className="modal-body">
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

              {modalInternship.description && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Description</h3>
                  <p className="modal-description">{modalInternship.description}</p>
                </div>
              )}

              {modalInternship.requiredSkills && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Required Skills</h3>
                  <div className="modal-skills-list-full">
                    {modalInternship.requiredSkills?.split(',').map((skill, idx) => (
                      <span key={idx} className="modal-skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

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
                  className="modal-apply-now-btn"
                  onClick={() => {
                    handleCloseModal();
                    handleApply(modalInternship.id);
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

export default PublicCompanies;