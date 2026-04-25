import React, { useState } from 'react';
import { FiMapPin, FiClock, FiDollarSign, FiBriefcase, FiChevronDown, FiChevronUp, FiSend, FiCheckCircle } from 'react-icons/fi';
import './InternshipCard.css';

const InternshipCard = ({ internship, onApply, isApplied }) => {
  const [expanded, setExpanded] = useState(false);

  const handleApply = () => {
    if (!isApplied) {
      onApply(internship);
    }
  };

  return (
    <div className={`internship-card ${isApplied ? 'applied' : ''}`}>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{internship.title}</h3>
          {isApplied && (
            <span className="applied-badge">
              <FiCheckCircle /> Applied
            </span>
          )}
        </div>
        
        <div className="company-info">
          <FiBriefcase className="company-icon" />
          <span className="company-name">{internship.companyName || internship.company?.companyName}</span>
        </div>

        <div className="internship-meta">
          <div className="meta-item">
            <FiMapPin className="meta-icon" />
            <span>{internship.location || 'Location not specified'}</span>
          </div>
          <div className="meta-item">
            <FiClock className="meta-icon" />
            <span>{internship.duration || 'Duration not specified'}</span>
          </div>
          {internship.stipend && (
            <div className="meta-item">
              <FiDollarSign className="meta-icon" />
              <span>{typeof internship.stipend === 'string' ? internship.stipend : `₹${internship.stipend}/month`}</span>
            </div>
          )}
        </div>

        <div className="skills-section">
          <h4 className="skills-title">Required Skills:</h4>
          <div className="skills-list">
            {internship.requiredSkills?.split(',').map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        <button 
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : 'Show more'}
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {expanded && (
          <div className="expanded-content">
            <p className="description">{internship.description || 'No description available'}</p>
            <p className="posted-date">
              Posted: {internship.postedAt ? new Date(internship.postedAt).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        )}

        <button 
          className={`apply-btn ${isApplied ? 'applied' : ''}`}
          onClick={handleApply}
          disabled={isApplied}
        >
          {isApplied ? (
            <>Already Applied</>
          ) : (
            <><FiSend /> Apply Now</>
          )}
        </button>
      </div>
    </div>
  );
};

export default InternshipCard;