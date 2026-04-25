import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import companyService from '../../services/companyService';
import ApplicationForm from './ApplicationForm';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiMapPin, 
  FiArrowLeft,
  FiBriefcase,
  FiUsers,
  FiGlobe,
  FiMail,
  FiPhone,
  FiArrowRight,
  FiInfo,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiExternalLink,
  FiSend
} from 'react-icons/fi';
import './StudentCompanies.css';

const StudentCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyInternships, setCompanyInternships] = useState([]);
  const [loadingInternships, setLoadingInternships] = useState(false);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalInternship, setModalInternship] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [appliedInternships, setAppliedInternships] = useState(new Set());

  useEffect(() => {
    loadCompanies();
    loadAppliedInternships();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, companies]);

  const loadAppliedInternships = async () => {
    try {
      const applications = await companyService.getStudentApplications(user.id);
      const appliedIds = new Set(applications.map(app => app.internshipId));
      setAppliedInternships(appliedIds);
    } catch (error) {
      console.error('Error loading applied internships:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getTopCompanies();
      console.log('Companies loaded:', data);
      setCompanies(data || []);
      setFiltered(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
      setCompanies([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (companyId) => {
    setLoadingCompanyDetails(true);
    try {
      console.log('🔍 Loading company details for ID:', companyId);
      const companyFromList = companies.find(c => c.id === companyId);
      
      if (companyFromList) {
        setSelectedCompany(prev => ({
          ...prev,
          ...companyFromList,
          description: companyFromList.description || 'No description available.',
          email: companyFromList.email || `contact@${companyFromList.companyName?.toLowerCase()}.com`,
          phone: companyFromList.phone || '+91 9876543210',
          website: companyFromList.website || `www.${companyFromList.companyName?.toLowerCase()}.com`
        }));
      } else {
        try {
          const companyDetails = await companyService.getCompanyById(companyId);
          if (companyDetails) {
            setSelectedCompany(prev => ({
              ...prev,
              ...companyDetails,
              description: companyDetails.description || 'No description available.',
              email: companyDetails.email || 'contact@company.com',
              phone: companyDetails.phone || '+91 9876543210',
              website: companyDetails.website || 'www.company.com'
            }));
          }
        } catch (apiError) {
          console.log('API fetch failed, using default company data');
          const defaultCompany = companies.find(c => c.id === companyId);
          setSelectedCompany(defaultCompany || {});
        }
      }
    } catch (error) {
      console.error('Error loading company details:', error);
      toast.error('Could not load company details');
    } finally {
      setLoadingCompanyDetails(false);
    }
  };

  const loadCompanyInternships = async (companyId) => {
    setLoadingInternships(true);
    try {
      console.log('🔍 Loading internships for company ID:', companyId);
      
      const allInternships = await companyService.getAllOpenInternships();
      console.log('All internships:', allInternships);
      
      const filteredInternships = allInternships.filter(internship => {
        const internshipCompanyId = internship.companyId || 
                                   internship.company?.id || 
                                   internship.company_id;
        return internshipCompanyId === companyId;
      });
      
      console.log(`✅ Found ${filteredInternships.length} internships for company ${companyId}`);
      setCompanyInternships(filteredInternships || []);
      
      if (filteredInternships.length === 0) {
        toast('No internships available for this company', {
          icon: 'ℹ️',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('❌ Error loading company internships:', error);
      setCompanyInternships([]);
      toast.error('Could not load internships. Please try again.');
    } finally {
      setLoadingInternships(false);
    }
  };

  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);
    await Promise.allSettled([
      loadCompanyDetails(company.id),
      loadCompanyInternships(company.id)
    ]);
  };

  const handleBackClick = () => {
    setSelectedCompany(null);
    setCompanyInternships([]);
  };

  const handleShowDetails = (internship) => {
    setModalInternship(internship);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setModalInternship(null);
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
    setShowDetailsModal(false);
  };

  const handleApplicationClose = () => {
    setShowApplicationForm(false);
    setSelectedInternship(null);
  };

  const handleApplicationSuccess = () => {
    loadAppliedInternships();
    loadCompanyInternships(selectedCompany?.id);
  };

  const filterCompanies = () => {
    if (!searchTerm.trim()) {
      setFiltered(companies);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = companies.filter(company =>
      company.companyName?.toLowerCase().includes(term) ||
      company.location?.toLowerCase().includes(term)
    );
    setFiltered(filtered);
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="companies-page">
      {/* Header */}
      <div className="page-header">
        <Link to="/student/dashboard" className="back-link">
          <FiArrowLeft /> Dashboard
        </Link>
        <h1 className="page-title">Top Hiring Companies</h1>
        <p className="page-subtitle">Explore internships from leading companies</p>
      </div>

      {!selectedCompany ? (
        /* Companies List View */
        <>
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
              <FiUsers /> {filtered.length} companies
            </div>
          </div>

          {/* Companies Grid - No Stats Row */}
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
                  onClick={() => handleCompanyClick(company)}
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
        </>
      ) : (
        /* Company Detail View */
        <div className="company-detail-view">
          {/* Back Button */}
          <button className="back-to-companies" onClick={handleBackClick}>
            <FiArrowLeft /> Back to Companies
          </button>

          {loadingCompanyDetails ? (
            <div className="loading-details">
              <div className="small-spinner"></div>
              <p>Loading company details...</p>
            </div>
          ) : (
            <>
              {/* Company Profile Card */}
              <div className="company-profile-card">
                <div className="profile-header">
                  <div 
                    className="profile-logo"
                    style={{ backgroundColor: getColor(selectedCompany.companyName) }}
                  >
                    <span className="profile-initials">{getInitials(selectedCompany.companyName)}</span>
                  </div>
                  <div className="profile-info">
                    <h2 className="profile-company-name">{selectedCompany.companyName}</h2>
                    <div className="profile-meta">
                      <span className="profile-location">
                        <FiMapPin /> {selectedCompany.location || 'Pune'}
                      </span>
                      <span className="profile-website">
                        <FiGlobe /> {selectedCompany.website || 'www.company.com'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-description">
                  <h3><FiInfo /> About Company</h3>
                  <p className="company-description">
                    {selectedCompany.description || 'No description available.'}
                  </p>
                </div>

                <div className="profile-contact">
                  <h3>Contact Information</h3>
                  <div className="contact-grid">
                    <div className="contact-item">
                      <FiMail className="contact-icon" />
                      <span>{selectedCompany.email || 'contact@company.com'}</span>
                    </div>
                    <div className="contact-item">
                      <FiPhone className="contact-icon" />
                      <span>{selectedCompany.phone || '+91 9876543210'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internships Section */}
              <div className="company-internships-section">
                <h3 className="internships-section-title">
                  <FiBriefcase /> Internships at {selectedCompany.companyName}
                </h3>

                {loadingInternships ? (
                  <div className="loading-internships">
                    <div className="small-spinner"></div>
                    <p>Loading internships...</p>
                  </div>
                ) : companyInternships.length === 0 ? (
                  <div className="no-internships">
                    <p>No internships available at this company right now.</p>
                  </div>
                ) : (
                  <div className="internships-grid">
                    {companyInternships.map((internship) => {
                      const isApplied = appliedInternships.has(internship.id);
                      const deadlineNear = isDeadlineNear(internship.endDate) && !isDeadlinePassed(internship.endDate);
                      const deadlinePassed = isDeadlinePassed(internship.endDate);
                      
                      return (
                        <div key={internship.id} className={`internship-card-modern ${isApplied ? 'applied' : ''}`}>
                          {isApplied && (
                            <div className="applied-badge-small">
                              Applied
                            </div>
                          )}
                          
                          <h3 className="card-title">{internship.title}</h3>

                          <div className="company-info">
                            <FiBriefcase className="company-icon" />
                            <span>{selectedCompany.companyName}</span>
                          </div>

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

                          <button 
                            className="show-details-btn"
                            onClick={() => handleShowDetails(internship)}
                          >
                            <FiExternalLink /> Show Details
                          </button>

                          <button 
                            className={`apply-now-btn ${isApplied ? 'applied' : ''} ${deadlinePassed ? 'disabled' : ''}`}
                            onClick={() => handleApplyClick(internship)}
                            disabled={isApplied || deadlinePassed}
                          >
                            {isApplied ? (
                              'Already Applied'
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
              </div>
            </>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && modalInternship && (
        <div className="details-modal-overlay" onClick={handleCloseModal}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <FiArrowRight />
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

              {modalInternship.description && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Description</h3>
                  <p className="modal-description">{modalInternship.description}</p>
                </div>
              )}

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
              <button 
                className="modal-apply-now-btn"
                onClick={() => {
                  handleCloseModal();
                  handleApplyClick(modalInternship);
                }}
                disabled={appliedInternships.has(modalInternship.id) || isDeadlinePassed(modalInternship.endDate)}
              >
                {appliedInternships.has(modalInternship.id) ? 'Already Applied' : 'Apply Now'}
              </button>
            </div>
          </div>
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
    </div>
  );
};

export default StudentCompanies;