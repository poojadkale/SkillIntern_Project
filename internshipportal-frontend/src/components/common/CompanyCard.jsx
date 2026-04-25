// src/components/common/CompanyCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMapPin, FiBriefcase } from 'react-icons/fi';
import './CompanyCard.css';

const CompanyCard = ({ company }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Generate initials from company name
  const getInitials = (name) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a consistent color based on company name
  const getColor = (name) => {
    const colors = [
      '#1E3A8A', '#B45309', '#065F46', '#92400E', 
      '#831843', '#1E40AF', '#854D0E', '#166534',
      '#9B59B6', '#E67E22', '#16A085', '#27AE60',
      '#8B5CF6', '#A855F7', '#EC4899', '#06B6D4'
    ];
    let hash = 0;
    for (let i = 0; i < name?.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleViewInternships = () => {
    if (user) {
      navigate(`/student/internships?company=${company.id}`);
    } else {
      navigate('/login', { state: { from: `/internships?company=${company.id}` } });
    }
  };

  return (
    <div className="company-card" onClick={handleViewInternships}>
      <div 
        className="company-logo-placeholder"
        style={{ backgroundColor: getColor(company.companyName) }}
      >
        <span className="company-initials">{getInitials(company.companyName)}</span>
      </div>
      <h3 className="company-name">{company.companyName}</h3>
      {company.industry && (
        <p className="company-industry">{company.industry}</p>
      )}
      {company.location && (
        <p className="company-location">
          <FiMapPin className="location-icon" /> {company.location}
        </p>
      )}
      <p className="company-openings">
        <FiBriefcase className="briefcase-icon" /> 
        {company.internshipCount || 0} {company.internshipCount === 1 ? 'Opening' : 'Openings'}
      </p>
      <button className="btn-view">
        View Internships
      </button>
    </div>
  );
};

export default CompanyCard;