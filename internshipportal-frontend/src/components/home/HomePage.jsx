import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiMapPin, FiClock, FiDollarSign, FiBriefcase, FiUsers, FiAward } from 'react-icons/fi';
import homeService from '../../services/homeService';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [internships, setInternships] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    internships: 0,
    companies: 0,
    activeStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      const [companiesData, internshipsData, statsData] = await Promise.all([
        homeService.getTopCompanies(),
        homeService.getFeaturedInternships(),
        homeService.getStats()
      ]);

      setCompanies(companiesData || []);
      setInternships(internshipsData || []);
      
      setStats({
        internships: statsData?.internships || internshipsData?.length || 0,
        companies: statsData?.companies || companiesData?.length || 0,
        activeStudents: statsData?.students || statsData?.activeStudents || 12500
      });
    } catch (error) {
      console.error('Error fetching home data:', error);
      setStats({
        internships: 0,
        companies: 0,
        activeStudents: 12500
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to internships page with search query parameter
      navigate(`/internships?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading amazing opportunities...</p>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        {/* FLOATING TECH SHAPES */}
        <div className="tech-shape shape1"></div>
        <div className="tech-shape shape2"></div>

        {/* FLOATING TECH ICONS */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/226/226777.png"
          className="tech-icon icon1"
          alt="java"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/919/919851.png"
          className="tech-icon icon2"
          alt="react"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/919/919836.png"
          className="tech-icon icon3"
          alt="database"
        />

        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              India's Premier Internship Platform
            </div>
            <h1 
              className="hero-title"
              style={{ color: '#0a2540' }}
            >
              Find the Right Internship for Your Career
            </h1>
            <p className="hero-description">
              Explore thousands of internships from top companies and build your future with SkillIntern.
            </p>
            
            <form onSubmit={handleSearch} className="hero-search">
              <div className="search-wrapper">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by title, company, or skill..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Search</button>
              </div>
            </form>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.internships}+</span>
                <span className="stat-label">Internships</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{stats.companies}+</span>
                <span className="stat-label">Companies</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{stats.activeStudents.toLocaleString()}+</span>
                <span className="stat-label">Students</span>
              </div>
            </div>
          </div>
          
          <div className="hero-right">
            <img
              src="https://img.freepik.com/free-vector/job-hunt-concept-illustration_114360-436.jpg"
              alt="hero"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="trusted-section">
        <div className="container">
          <p className="trusted-label">Trusted by Leading Companies</p>
          <div className="trusted-grid">
            {companies.slice(0, 8).map((company, idx) => (
              <div key={idx} className="trusted-card">
                <div className="trusted-logo">{company.companyName?.charAt(0)}</div>
                <h4>{company.companyName}</h4>
                <span>{company.location || 'India'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-tag">Featured Opportunities</span>
              <h2>Latest Internships</h2>
              <p>Curated opportunities from top companies</p>
            </div>
            <Link to="/internships" className="explore-link">
              View All <FiArrowRight />
            </Link>
          </div>
          
          <div className="internships-grid">
            {internships.slice(0, 6).map((internship) => (
              <div key={internship.id} className="internship-card">
                <h3>{internship.title}</h3>
                <p className="company-name">{internship.companyName}</p>
                <div className="card-details">
                  <span><FiMapPin /> {internship.location || 'Remote'}</span>
                  <span><FiClock /> {internship.duration || '3 months'}</span>
                  <span><FiDollarSign /> ₹{internship.stipend}/mo</span>
                </div>
                <div className="card-skills">
                  {internship.requiredSkills?.split(',').slice(0, 3).map((skill, i) => (
                    <span key={i}>{skill.trim()}</span>
                  ))}
                </div>
                <button className="apply-btn" onClick={() => navigate('/register')}>
                  Apply Now <FiArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-header center">
            <span className="section-tag">Simple Process</span>
            <h2>How SkillIntern Works</h2>
            <p>Three simple steps to start your journey</p>
          </div>
          <div className="process-grid">
            <div className="process-card">
              <div className="process-number">01</div>
              <h3>Create Your Profile</h3>
              <p>Sign up and build your professional profile with your skills, education, and experience.</p>
            </div>
            <div className="process-card">
              <div className="process-number">02</div>
              <h3>Apply to Internships</h3>
              <p>Browse through hundreds of opportunities and apply to the ones that match your interests.</p>
            </div>
            <div className="process-card">
              <div className="process-number">03</div>
              <h3>Get Hired</h3>
              <p>Companies review your application and reach out to you for interviews and selection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Begin Your Journey?</h2>
          <p>Join {stats.activeStudents.toLocaleString()}+ students who have already found their perfect internship</p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => navigate('/register')}>
              Get Started Free <FiArrowRight />
            </button>
            <button className="cta-secondary" onClick={() => navigate('/internships')}>
              Browse Internships
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;