import React from 'react';
import { 
  FiTarget, 
  FiEye, 
  FiHeart, 
  FiBriefcase, 
  FiUsers, 
  FiStar,
  FiThumbsUp,
  FiCalendar,
  FiMapPin,
  FiGlobe,
  FiArrowRight
} from 'react-icons/fi';
import './AboutUs.css';

const AboutUs = () => {
  const values = [
    {
      icon: <FiTarget />,
      title: 'Our Mission',
      description: 'To bridge the gap between talented students and forward-thinking companies by providing a platform that makes internship discovery seamless and effective.'
    },
    {
      icon: <FiEye />,
      title: 'Our Vision',
      description: 'To become the world\'s leading internship platform, empowering the next generation of professionals to build successful careers.'
    },
    {
      icon: <FiHeart />,
      title: 'Our Values',
      description: 'We believe in transparency, equal opportunity, innovation, and putting users first in everything we do.'
    }
  ];

  const features = [
    {
      icon: <FiBriefcase />,
      title: 'Quality Internships',
      description: 'Curated opportunities from top companies across various industries'
    },
    {
      icon: <FiUsers />,
      title: 'Verified Companies',
      description: 'All companies are verified to ensure genuine opportunities'
    },
    {
      icon: <FiStar />,
      title: 'Easy Application',
      description: 'One-click application process with profile management'
    },
    {
      icon: <FiThumbsUp />,
      title: 'Career Growth',
      description: 'Build your professional network and gain valuable experience'
    }
  ];

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About <span className="hero-highlight">SkillIntern</span></h1>
          <p className="about-hero-subtitle">
            Empowering students and companies to connect, grow, and succeed together
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="about-story-section">
        <div className="about-container">
          <div className="story-grid">
            <div className="story-content">
              <h2 className="section-title">Our Story</h2>
              <p className="story-text">
                SkillIntern was born from a simple observation: talented students struggle to find quality internships, 
                and companies struggle to find passionate young talent. We decided to bridge this gap by creating a 
                platform that connects both sides seamlessly.
              </p>
              <p className="story-text">
                Founded in 2024, SkillIntern has grown to become one of India's fastest-growing internship platforms, 
                helping thousands of students kickstart their careers and enabling companies to discover fresh talent.
              </p>
              <div className="story-highlights">
                <div className="highlight-item">
                  <FiCalendar />
                  <span>Founded in 2024</span>
                </div>
                <div className="highlight-item">
                  <FiMapPin />
                  <span>Headquarters: Bangalore, India</span>
                </div>
                <div className="highlight-item">
                  <FiGlobe />
                  <span>Pan-India Presence</span>
                </div>
              </div>
            </div>
            <div className="story-image">
              <div className="story-image-placeholder">
                <div className="placeholder-icon">
                  <FiBriefcase />
                </div>
                <p>Connecting Talent with Opportunity</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="about-mission-section">
        <div className="about-container">
          <div className="mission-grid">
            {values.map((value, index) => (
              <div key={index} className="mission-card">
                <div className="mission-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="about-features-section">
        <div className="about-container">
          <h2 className="section-title text-center">Why Choose SkillIntern?</h2>
          <p className="section-subtitle text-center">
            We make internship discovery simple, transparent, and effective
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="about-cta-section">
        <div className="about-container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of students and companies already using SkillIntern</p>
            <div className="cta-buttons">
              <a href="/register/student" className="cta-btn-primary">
                Get Started as Student <FiArrowRight />
              </a>
              <a href="/register/company" className="cta-btn-secondary">
                Post Internships
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;