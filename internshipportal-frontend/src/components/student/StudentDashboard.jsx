import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import companyService from '../../services/companyService';
import { 
  FiBriefcase, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiUser, 
  FiTrendingUp, 
  FiAward, 
  FiCalendar,
  FiBookOpen,
  FiCode
} from 'react-icons/fi';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    if (!authLoading) {
      let studentId = user?.userId || user?.id;
      if (!studentId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          studentId = parsed.userId || parsed.id;
        }
      }
      if (studentId) loadData(Number(studentId));
      else setLoading(false);
    }
  }, [authLoading, user]);

  const loadData = async (studentId) => {
    try {
      setLoading(true);
      
      try {
        const profileData = await companyService.getStudentProfile(studentId);
        setProfile(profileData);
      } catch (err) {
        console.error('Profile error:', err);
      }
      
      try {
        const appsData = await companyService.getStudentApplications(studentId);
        const apps = Array.isArray(appsData) ? appsData : (appsData?.data || []);
        setApplications(apps);
        
        setStats({
          total: apps.length,
          pending: apps.filter(a => a.status === 'PENDING').length,
          accepted: apps.filter(a => a.status === 'ACCEPTED' || a.status === 'APPROVED').length,
          rejected: apps.filter(a => a.status === 'REJECTED').length
        });
      } catch (err) {
        console.error('Applications error:', err);
      }
      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, <span className="highlight-name">{user?.fullName?.split(' ')[0] || 'Student'}</span>! </h1>
          <p>Track your internship applications and career progress</p>
        </div>
        
      </div>

      {/* Stats Cards - Equal Size */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon total-icon">
            <FiBriefcase />
          </div>
          <div className="stat-info">
            <h3>Total Applications</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending-icon">
            <FiClock />
          </div>
          <div className="stat-info">
            <h3>Pending Review</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accepted-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <h3>Accepted</h3>
            <p className="stat-number">{stats.accepted}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected-icon">
            <FiXCircle />
          </div>
          <div className="stat-info">
            <h3>Rejected</h3>
            <p className="stat-number">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="two-columns">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3>
              <FiUser className="section-icon" /> Student Profile
            </h3>
          </div>
          {profile ? (
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">College</span>
                <span className="info-value">{profile.collegeName || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Course</span>
                <span className="info-value">{profile.course || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Branch</span>
                <span className="info-value">{profile.branch || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Year</span>
                <span className="info-value">{profile.yearOfStudy || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">CGPA</span>
                <span className="info-value">{profile.cgpa || 'Not set'}</span>
              </div>
              <div className="skills-section">
                <span className="info-label">Skills</span>
                <div className="skills-tags">
                  {profile.skills?.split(',').map((skill, i) => (
                    <span key={i} className="skill-tag">{skill.trim()}</span>
                  )) || 'Not set'}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FiBookOpen className="empty-icon" />
              <p>Complete your profile to get noticed by companies</p>
              <button className="btn-primary">Edit Profile</button>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="applications-card">
          <div className="card-header">
            <h3>
              <FiBriefcase className="section-icon" /> Recent Applications
            </h3>
          </div>
          {applications.length === 0 ? (
            <div className="empty-state">
              <FiCode className="empty-icon" />
              <p>No applications yet</p>
              <Link to="/internships">
                <button className="btn-outline">Browse Internships</button>
              </Link>
            </div>
          ) : (
            <div className="applications-list">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="app-item">
                  <div className="app-info">
                    <h4>{app.internshipTitle}</h4>
                    <p>{app.companyName}</p>
                    <span className="app-date">
                      <FiCalendar /> Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`status-badge ${app.status?.toLowerCase()}`}>
                    {app.status || 'PENDING'}
                  </span>
                </div>
              ))}
              {applications.length > 5 && (
                <Link to="/internships">
                  <button className="view-all-btn">View All Applications →</button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;