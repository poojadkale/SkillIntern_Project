import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiBriefcase, 
  FiUsers, 
  FiFilter,
  FiX,
  FiTrendingUp,
  FiAward,
  FiStar,
  FiArrowRight,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import homeService from '../../services/homeService';
import CompanyCard from './CompanyCard';
import './Companies.css';

const Companies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [industries, setIndustries] = useState(['All Industries']);
  const [locations, setLocations] = useState(['All Locations']);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching all companies from database...');
      
      const data = await homeService.getAllCompanies();
      
      console.log('✅ Companies loaded:', data.length);
      setCompanies(data);
      
      const uniqueIndustries = [...new Set(data.map(c => c.industry).filter(Boolean))];
      const uniqueLocations = [...new Set(data.map(c => c.location).filter(Boolean))];
      setIndustries(['All Industries', ...uniqueIndustries]);
      setLocations(['All Locations', ...uniqueLocations]);
      
    } catch (err) {
      console.error('❌ Error fetching companies:', err);
      setError(err.message || 'Failed to load companies. Please try again later.');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCompany = (companyId) => {
    if (user) {
      navigate(`/student/companies/${companyId}`);
    } else {
      navigate('/login', { state: { from: `/company/${companyId}` } });
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === '' || selectedIndustry === 'All Industries' || 
                            company.industry === selectedIndustry;
    const matchesLocation = selectedLocation === '' || selectedLocation === 'All Locations' || 
                            company.location === selectedLocation;
    return matchesSearch && matchesIndustry && matchesLocation;
  });

  const featuredCompanies = companies.filter(c => c.featured === true);
  const totalInternships = companies.reduce((total, company) => total + (company.internshipCount || 0), 0);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedLocation('');
  };

  if (loading) {
    return (
      <div className="companies-loading">
        <div className="loading-spinner"></div>
        <p>Loading companies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="companies-error">
        <div className="error-content">
          <FiAlertCircle className="error-icon" />
          <h3>Unable to Load Companies</h3>
          <p>{error}</p>
          <button onClick={fetchCompanies} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="companies-page">
      {/* Hero Section */}
      <div className="companies-hero">
        <div className="companies-hero-content">
          <h1 className="companies-hero-title">Top Companies Hiring</h1>
          <p className="companies-hero-subtitle">
            Discover internship opportunities from India's leading companies
          </p>
          
          {/* Search Bar */}
          <div className="companies-search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="companies-container">
        {/* Stats Section */}
        <div className="companies-stats">
          <div className="stat-item">
            <FiTrendingUp className="stat-icon" />
            <span className="stat-number">{companies.length}+</span>
            <span className="stat-label">Partner Companies</span>
          </div>
          <div className="stat-item">
            <FiBriefcase className="stat-icon" />
            <span className="stat-number">{totalInternships}+</span>
            <span className="stat-label">Active Internships</span>
          </div>
          <div className="stat-item">
            <FiUsers className="stat-icon" />
            <span className="stat-number">12,000+</span>
            <span className="stat-label">Students Placed</span>
          </div>
        </div>

        {/* Featured Companies Section */}
        {featuredCompanies.length > 0 && !searchTerm && !selectedIndustry && !selectedLocation && (
          <div className="featured-section">
            <h2 className="section-title">
              <FiAward className="title-icon" />
              Featured Companies
            </h2>
            <div className="featured-grid">
              {featuredCompanies.slice(0, 3).map(company => (
                <div key={company.id} className="featured-card">
                  <div className="featured-badge">Featured</div>
                  <div className="featured-logo">
                    {company.companyName?.charAt(0) || 'C'}
                  </div>
                  <h3>{company.companyName}</h3>
                  <div className="company-rating">
                    <FiStar className="star-icon" />
                    <span>{company.rating || 4.5}</span>
                    <span className="reviews">({company.reviews || 0} reviews)</span>
                  </div>
                  <p>{company.description?.substring(0, 100) || 'No description available'}...</p>
                  <button 
                    className="view-company-btn"
                    onClick={() => handleViewCompany(company.id)}
                  >
                    View Company <FiArrowRight />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-header">
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {(selectedIndustry !== '' && selectedIndustry !== 'All Industries') || 
             (selectedLocation !== '' && selectedLocation !== 'All Locations') && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <FiX /> Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Industry</label>
                <select 
                  value={selectedIndustry} 
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="filter-select"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Location</label>
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="filter-select"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="results-header">
          <h2>
            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'Company' : 'Companies'} Found
          </h2>
          {(searchTerm || (selectedIndustry !== '' && selectedIndustry !== 'All Industries') || 
            (selectedLocation !== '' && selectedLocation !== 'All Locations')) && (
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="companies-grid">
            {filteredCompanies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <FiSearch className="no-results-icon" />
            <h3>No companies found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;