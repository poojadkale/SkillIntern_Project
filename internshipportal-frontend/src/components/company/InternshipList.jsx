import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiMapPin, FiClock, FiDollarSign, FiBriefcase, FiCalendar, FiUsers, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './InternshipList.css';

const InternshipList = ({ internships, onEdit, onDelete, onToggleStatus }) => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleDetails = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusClass = (status) => {
    return status === 'OPEN' ? 'status-open' : 'status-closed';
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

  return (
    <div className="internship-container">
      <div className="internship-grid">
        {internships.map((internship) => {
          const isExpanded = expandedCards[internship.id] || false;
          const deadlineNear = isDeadlineNear(internship.endDate) && internship.status === 'OPEN';
          const deadlinePassed = isDeadlinePassed(internship.endDate);
          
          return (
            <div key={internship.id} className="internship-card">
              {/* Header with Title and Status Badge */}
              <div className="card-header">
                <h3 className="card-title">{internship.title}</h3>
                <span className={`status-badge ${getStatusClass(internship.status)}`}>
                  {internship.status}
                </span>
              </div>

              {/* Company Info */}
              <div className="company-info">
                <FiBriefcase className="company-icon" />
                <span>{internship.company?.companyName || 'Company'}</span>
              </div>

              {/* Action Buttons */}
              <div className="action-row">
                <button
                  onClick={() => onEdit(internship)}
                  className="edit-btn"
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  onClick={() => onDelete(internship.id)}
                  className="delete-btn"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>

              {/* Basic Details - Always Visible */}
              <div className="details-section">
                <div className="detail-item">
                  <FiMapPin className="detail-icon" />
                  <span><strong>Location:</strong> {internship.location}</span>
                </div>
                <div className="detail-item">
                  <FiClock className="detail-icon" />
                  <span><strong>Duration:</strong> {internship.duration}</span>
                </div>
                <div className="detail-item">
                  <FiDollarSign className="detail-icon" />
                  <span><strong>Stipend:</strong> ₹{internship.stipend}/month</span>
                </div>
              </div>

              {/* Application End Date - Always Visible */}
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

              {/* Hide/Show Toggle Button */}
              <button 
                className="toggle-details-btn"
                onClick={() => toggleDetails(internship.id)}
              >
                {isExpanded ? (
                  <>Hide Details <FiChevronUp /></>
                ) : (
                  <>Show Details <FiChevronDown /></>
                )}
              </button>

              {/* Expanded Details - Hidden by default */}
              {isExpanded && (
                <div className="expanded-details">
                  {/* Openings & Work Type */}
                  <div className="meta-section">
                    <div className="meta-item">
                      <FiUsers className="meta-icon" />
                      <span><strong>Openings:</strong> {internship.numberOfOpenings || 0}</span>
                    </div>
                    <div className="meta-item">
                      <FiBriefcase className="meta-icon" />
                      <span><strong>Work Type:</strong> {internship.type || 'Online'}</span>
                    </div>
                  </div>

                  {/* Full Description */}
                  {internship.description && (
                    <div className="description-section">
                      <h4 className="section-title">Description</h4>
                      <p className="description-text">{internship.description}</p>
                    </div>
                  )}

                  {/* Required Skills */}
                  <div className="skills-section">
                    <h4 className="section-title">Required Skills</h4>
                    <div className="skills-list">
                      {internship.requiredSkills?.split(',').map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info - Smaller dates */}
                  <div className="additional-info">
                    <div className="info-row">
                      <span className="info-label">Posted:</span>
                      <span className="info-value small-date">{formatShortDate(internship.postedAt)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Updated:</span>
                      <span className="info-value small-date">{formatShortDate(internship.updatedAt || internship.postedAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InternshipList;