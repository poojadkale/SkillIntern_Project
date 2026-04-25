import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiUserCheck,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
  FiUserPlus,
  FiCheckSquare,
  FiBookOpen,
  FiSettings
} from 'react-icons/fi';
import './DashboardAnalytics.css';

const DashboardAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalStudents: 0,
    totalInternships: 0,
    totalApplications: 0,
    activeInternships: 0,
    completedInternships: 0
  });
  const [trends, setTrends] = useState({
    userGrowth: 0,
    internshipGrowth: 0,
    applicationGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Remove pendingUsers from Promise.all
      const [
        statistics,
        applications,
        users,
        companies,
        internships
      ] = await Promise.all([
        adminService.getStatistics(),
        adminService.getAllApplications(),
        adminService.getAllUsers(),
        adminService.getAllCompanies(),
        adminService.getAllInternships()
        // ❌ Removed: adminService.getPendingUsers()
      ]);

      setStats({
        totalUsers: statistics.totalUsers || users?.length || 0,
        totalCompanies: statistics.totalCompanies || companies?.length || 0,
        totalStudents: statistics.totalStudents || 0,
        totalInternships: statistics.totalInternships || internships?.length || 0,
        totalApplications: statistics.totalApplications || applications?.length || 0,
        activeInternships: internships?.filter(i => i.status === 'OPEN').length || 0,
        completedInternships: internships?.filter(i => i.status === 'CLOSED').length || 0
      });

      // Calculate trends (keep existing logic)
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      
      const currentMonthUsers = users?.filter(u => {
        const date = u.createdAt || u.registeredAt;
        return date ? new Date(date).getMonth() === currentMonth : false;
      }).length || 0;
      
      const lastMonthUsers = users?.filter(u => {
        const date = u.createdAt || u.registeredAt;
        return date ? new Date(date).getMonth() === lastMonth : false;
      }).length || 0;
      
      const userGrowth = lastMonthUsers === 0 ? 0 : ((currentMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1);
      
      const currentMonthInternships = internships?.filter(i => {
        const date = i.postedAt;
        return date ? new Date(date).getMonth() === currentMonth : false;
      }).length || 0;
      
      const lastMonthInternships = internships?.filter(i => {
        const date = i.postedAt;
        return date ? new Date(date).getMonth() === lastMonth : false;
      }).length || 0;
      
      const internshipGrowth = lastMonthInternships === 0 ? 0 : ((currentMonthInternships - lastMonthInternships) / lastMonthInternships * 100).toFixed(1);
      
      const currentMonthApps = applications?.filter(a => {
        const date = a.appliedAt;
        return date ? new Date(date).getMonth() === currentMonth : false;
      }).length || 0;
      
      const lastMonthApps = applications?.filter(a => {
        const date = a.appliedAt;
        return date ? new Date(date).getMonth() === lastMonth : false;
      }).length || 0;
      
      const applicationGrowth = lastMonthApps === 0 ? 0 : ((currentMonthApps - lastMonthApps) / lastMonthApps * 100).toFixed(1);
      
      setTrends({
        userGrowth: parseFloat(userGrowth),
        internshipGrowth: parseFloat(internshipGrowth),
        applicationGrowth: parseFloat(applicationGrowth)
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const topStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <FiUsers />,
      bg: 'linear-gradient(135deg, #1e5a8a 0%, #2c6e9e 100%)',
      trend: trends.userGrowth
    },
    {
      title: 'Total Internships',
      value: stats.totalInternships,
      icon: <FiBriefcase />,
      bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      trend: trends.internshipGrowth
    },
    {
      title: 'Applications',
      value: stats.totalApplications,
      icon: <FiFileText />,
      bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      trend: trends.applicationGrowth
    }
  ];

  const secondaryStats = [
    {
      title: 'Companies',
      value: stats.totalCompanies,
      icon: <FiBriefcase />,
      color: '#3b82f6',
      bg: '#eef2ff'
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: <FiUserCheck />,
      color: '#f59e0b',
      bg: '#fef3c7'
    },
    {
      title: 'Active Internships',
      value: stats.activeInternships,
      icon: <FiCheckCircle />,
      color: '#10b981',
      bg: '#dcfce7'
    },
    {
      title: 'Completed Internships',
      value: stats.completedInternships,
      icon: <FiCheckSquare />,
      color: '#5a6e85',
      bg: '#f1f5f9'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      icon: <FiUsers />,
      path: '/admin/users',
      color: '#1e5a8a',
      bg: '#eef2ff',
      description: 'View and manage all users'
    },
    {
      title: 'Manage Internships',
      icon: <FiBriefcase />,
      path: '/admin/internships',
      color: '#f59e0b',
      bg: '#fef3c7',
      description: 'View and manage internships'
    },
    {
      title: 'View Applications',
      icon: <FiFileText />,
      path: '/admin/applications',
      color: '#ef4444',
      bg: '#fee2e2',
      description: 'Review all applications'
    },
    {
      title: 'Manage Companies',
      icon: <FiBriefcase />,
      path: '/admin/companies',
      color: '#3b82f6',
      bg: '#eef2ff',
      description: 'View company profiles'
    },
    {
      title: 'Manage Students',
      icon: <FiUserCheck />,
      path: '/admin/students',
      color: '#f59e0b',
      bg: '#fef3c7',
      description: 'View student profiles'
    },
    {
      title: 'Settings',
      icon: <FiSettings />,
      path: '/admin/settings',
      color: '#5a6e85',
      bg: '#f1f5f9',
      description: 'Configure platform settings'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loader">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Welcome Section */}
      <div className="welcome-card">
        <div className="welcome-content">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your internship portal.</p>
        </div>
        <div className="date-badge">
          <FiCalendar />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="stats-row-primary">
        {topStats.map((stat, index) => (
          <div key={index} className="stat-card-primary">
            <div className="stat-icon-primary" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div className="stat-content-primary">
              <p className="stat-label">{stat.title}</p>
              <h2 className="stat-value">{stat.value.toLocaleString()}</h2>
              {stat.trend > 0 && (
                <div className="stat-trend positive">
                  <FiTrendingUp /> +{stat.trend}% from last month
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Grid */}
      <div className="stats-row-secondary">
        {secondaryStats.map((stat, index) => (
          <div key={index} className="stat-card-secondary">
            <div className="stat-icon-secondary" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content-secondary">
              <p className="stat-label">{stat.title}</p>
              <h3 className="stat-value">{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <div className="quick-actions-header">
          <FiBarChart2 className="header-icon" />
          <h2>Quick Actions</h2>
          <p>Common tasks to manage your platform</p>
        </div>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className="action-card"
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon" style={{ background: action.bg, color: action.color }}>
                {action.icon}
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <FiArrowRight className="action-arrow" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;