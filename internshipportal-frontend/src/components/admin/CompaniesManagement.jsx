import React, { useState, useEffect } from 'react';
import { FiSearch, FiMail, FiPhone, FiMapPin, FiGlobe, FiBriefcase, FiCheckCircle, FiClock, FiEye, FiTrash2, FiFileText, FiUser, FiCalendar } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import './CompaniesManagement.css';

const CompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCompanies();
      console.log('Companies data:', data);
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This will also delete all their internships and applications.')) {
      try {
        await adminService.deleteCompany(companyId);
        fetchCompanies();
        alert('Company deleted successfully');
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('Failed to delete company');
      }
    }
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const getInitials = (name) => {
    if (!name) return 'CO';
    return name.charAt(0).toUpperCase();
  };

  // Company status is always ACTIVE since approval is removed
  const getCompanyStatus = () => {
    return { class: 'status-active', icon: <FiCheckCircle />, text: 'Active' };
  };

  // Get internship status badge
  const getInternshipStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'OPEN':
        return { class: 'status-open', icon: <FiCheckCircle />, text: 'Open' };
      case 'CLOSED':
        return { class: 'status-closed', icon: <FiClock />, text: 'Closed' };
      default:
        return { class: 'status-open', icon: <FiCheckCircle />, text: status || 'Open' };
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    total: companies.length,
    active: companies.length
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
    <div className="companies-management">
      {/* Header Section */}
      <div className="page-header">
        <h2>Companies Management</h2>
        <div className="header-stats">
          <div className="stat-chip">
            <FiBriefcase />
            <span>{stats.total}</span> Total
          </div>
          <div className="stat-chip active">
            <FiCheckCircle />
            <span>{stats.active}</span> Active
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search companies by name, email, contact person, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>No companies found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="companies-grid">
          {filteredCompanies.map(company => {
            const status = getCompanyStatus();
            return (
              <div key={company.id} className="company-card">
                <div className="company-header">
                  <div className="company-info">
                    <div className="company-avatar">
                      {getInitials(company.companyName)}
                    </div>
                    <div className="company-text">
                      <h3>{company.companyName}</h3>
                      <span className="company-id">ID: {company.id}</span>
                    </div>
                  </div>
                  <div className={`verification-badge ${status.class}`}>
                    {status.icon}
                    {status.text}
                  </div>
                </div>

                <div className="company-body">
                  <div className="info-row">
                    <FiUser />
                    <strong>Contact:</strong>
                    <span>{company.contactName || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <FiMail />
                    <strong>Email:</strong>
                    <span>{company.email || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <FiPhone />
                    <strong>Phone:</strong>
                    <span>{company.phone || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <FiMapPin />
                    <strong>Location:</strong>
                    <span>{company.location || 'N/A'}</span>
                  </div>
                  
                  {/* GST and Registration Number Preview */}
                  {(company.gstNumber || company.registrationNumber) && (
                    <div className="info-row verification-preview">
                      <FiFileText />
                      <strong>Verification:</strong>
                      <span>
                        {company.gstNumber && `GST: ${company.gstNumber}`}
                        {company.gstNumber && company.registrationNumber && ' | '}
                        {company.registrationNumber && `Reg: ${company.registrationNumber}`}
                      </span>
                    </div>
                  )}
                  
                  {company.description && (
                    <div className="info-row description">
                      <strong>Description:</strong>
                      <span>{company.description.substring(0, 80)}...</span>
                    </div>
                  )}
                </div>

                <div className="company-footer">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => handleViewCompany(company)}
                  >
                    <FiEye /> View Details
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteCompany(company.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Company Details Modal - Shows ALL Registration Details */}
      {showModal && selectedCompany && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Company Details - {selectedCompany.companyName}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Company Information */}
              <div className="modal-section">
                <h4><FiBriefcase /> Company Information</h4>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <span className="modal-info-label">Company Name</span>
                    <span className="modal-info-value">{selectedCompany.companyName}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Location</span>
                    <span className="modal-info-value">{selectedCompany.location || 'N/A'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Website</span>
                    {selectedCompany.website ? (
                      <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="modal-info-value link">
                        {selectedCompany.website}
                      </a>
                    ) : <span className="modal-info-value">N/A</span>}
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Status</span>
                    <span className="modal-status-badge status-active">Active</span>
                  </div>
                </div>
              </div>

              {/* Registration/Verification Details */}
              {(selectedCompany.gstNumber || selectedCompany.registrationNumber) && (
                <div className="modal-section">
                  <h4><FiFileText /> Registration & Verification Details</h4>
                  <div className="modal-info-grid">
                    {selectedCompany.gstNumber && (
                      <div className="modal-info-item">
                        <span className="modal-info-label">GST Number</span>
                        <span className="modal-info-value">{selectedCompany.gstNumber}</span>
                      </div>
                    )}
                    {selectedCompany.registrationNumber && (
                      <div className="modal-info-item">
                        <span className="modal-info-label">Registration Number</span>
                        <span className="modal-info-value">{selectedCompany.registrationNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Person Details */}
              <div className="modal-section">
                <h4><FiUser /> Contact Person Details</h4>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <span className="modal-info-label">Contact Name</span>
                    <span className="modal-info-value">{selectedCompany.contactName || 'N/A'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Email</span>
                    <span className="modal-info-value">{selectedCompany.email || 'N/A'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Phone</span>
                    <span className="modal-info-value">{selectedCompany.phone || 'N/A'}</span>
                  </div>
                  {selectedCompany.registeredAt && (
                    <div className="modal-info-item">
                      <span className="modal-info-label">Registered On</span>
                      <span className="modal-info-value">
                        {new Date(selectedCompany.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Description */}
              {selectedCompany.description && (
                <div className="modal-section">
                  <h4>About Company</h4>
                  <p className="modal-description">{selectedCompany.description}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="modal-section">
                <h4><FiBriefcase /> Statistics</h4>
                <div className="stats-mini-grid">
                  <div className="stat-mini-card">
                    <span className="stat-mini-value">{selectedCompany.totalInternships || 0}</span>
                    <span className="stat-mini-label">Total Internships</span>
                  </div>
                  <div className="stat-mini-card">
                    <span className="stat-mini-value">{selectedCompany.activeInternships || 0}</span>
                    <span className="stat-mini-label">Active Internships</span>
                  </div>
                  <div className="stat-mini-card">
                    <span className="stat-mini-value">{selectedCompany.totalApplications || 0}</span>
                    <span className="stat-mini-label">Total Applications</span>
                  </div>
                </div>
              </div>

              {/* Internships List */}
              {selectedCompany.internships && selectedCompany.internships.length > 0 && (
                <div className="modal-section">
                  <h4>Internships Posted</h4>
                  <div className="internships-list">
                    {selectedCompany.internships.map(internship => {
                      const internshipStatus = getInternshipStatusBadge(internship.status);
                      return (
                        <div key={internship.id} className="internship-item">
                          <div className="internship-info">
                            <strong>{internship.title}</strong>
                            <span className={`internship-status-badge ${internshipStatus.class}`}>
                              {internshipStatus.icon}
                              {internshipStatus.text}
                            </span>
                          </div>
                          <div className="internship-stats">
                            <span>{internship.applications || 0} applications</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="status-legend">
                    <p><strong>Note:</strong> <span className="status-open-indicator"></span> Open = Accepting Applications | <span className="status-closed-indicator"></span> Closed = Not Accepting Applications</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesManagement;