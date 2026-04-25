import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import NotificationBell from './NotificationBell';
import { 
  FiHome, 
  FiBriefcase, 
  FiFileText, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiUsers, 
  FiSettings,
  FiGrid,
  FiLogIn,
  FiInfo,
  FiMail,
  FiBarChart2,
  FiShield,
  FiMessageSquare
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingMessagesCount, setPendingMessagesCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch pending messages count for admin
  useEffect(() => {
    if (isAdmin) {
      fetchPendingMessagesCount();
      const interval = setInterval(fetchPendingMessagesCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchPendingMessagesCount = async () => {
    try {
      const response = await api.get('/contact/admin/pending-count');
      setPendingMessagesCount(response.data.count);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Check if we're on admin page (hide navbar on admin pages)
  const isAdminPage = location.pathname.startsWith('/admin');

  // Navigation for logged-in users based on role
  const getAuthenticatedNav = () => {
    if (isAdmin) {
      return [
        { path: '/admin', icon: <FiBarChart2 />, label: 'Dashboard' },
        { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
        { path: '/admin/companies', icon: <FiBriefcase />, label: 'Companies' },
        { path: '/admin/internships', icon: <FiFileText />, label: 'Internships' },
        { path: '/admin/applications', icon: <FiGrid />, label: 'Applications' },
        { path: '/admin/contact-messages', icon: <FiMail />, label: 'Contact Messages', badge: pendingMessagesCount },
        { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
      ];
    } else if (user?.role === 'COMPANY') {
      return [
        { path: '/company/dashboard', icon: <FiGrid />, label: 'Dashboard' },
        { path: '/company/applications', icon: <FiFileText />, label: 'Applications' },
        { path: '/company/profile', icon: <FiSettings />, label: 'Profile' },
        { path: '/company/messages', icon: <FiMessageSquare />, label: 'My Messages' },
        { path: '/contact', icon: <FiMail />, label: 'Contact Us' },
      ];
    } else if (user?.role === 'STUDENT') {
      return [
        { path: '/student/dashboard', icon: <FiHome />, label: 'Dashboard' },
        { path: '/student/internships', icon: <FiBriefcase />, label: 'Internships' },
        { path: '/student/companies', icon: <FiUsers />, label: 'Companies' },
        { path: '/student/applications', icon: <FiFileText />, label: 'Applications' },
        { path: '/student/profile', icon: <FiUser />, label: 'Profile' },
        { path: '/student/messages', icon: <FiMessageSquare />, label: 'My Messages' },
        { path: '/contact', icon: <FiMail />, label: 'Contact Us' },
      ];
    }
    return [];
  };

  const publicNav = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/internships', icon: <FiBriefcase />, label: 'Internships' },
    { path: '/companies', icon: <FiUsers />, label: 'Companies' },
    { path: '/about', icon: <FiInfo />, label: 'About Us' },
    { path: '/contact', icon: <FiMail />, label: 'Contact Us' },
  ];

  const navItems = user ? getAuthenticatedNav() : publicNav;

  if (isAdminPage) {
    return null;
  }

  const getLogoLink = () => {
    if (!user) return '/';
    if (isAdmin) return '/admin';
    if (user.role === 'COMPANY') return '/company/dashboard';
    if (user.role === 'STUDENT') return '/student/dashboard';
    return '/';
  };

  return (
    <nav className={`navbar-navy ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-navy-container">
        {/* Logo */}
        <Link to={getLogoLink()} className="logo-navy">
          <span className="logo-skill">Skill</span>
          <span className="logo-intern">Intern</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-navy-links">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`nav-navy-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-navy-icon">{item.icon}</span>
              <span className="nav-navy-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Right Side - Auth Buttons or User Info */}
        <div className="nav-navy-actions">
          {user ? (
            <>
              {/* Add NotificationBell here */}
              <NotificationBell userId={user.id} />
              
              <div className="user-info-navy">
                <div className="user-avatar-navy">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="user-name-navy">{user.fullName?.split(' ')[0]}</span>
                <span className={`user-role-navy ${isAdmin ? 'admin-role' : ''}`}>
                  {isAdmin ? 'ADMIN' : user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="logout-navy-btn" title="Logout">
                <FiLogOut />
              </button>
            </>
          ) : (
            <div className="auth-navy-buttons">
              <button onClick={() => navigate('/register')} className="register-navy-btn">
                Register
              </button>
              <button onClick={() => navigate('/login')} className="login-navy-btn">
                <FiLogIn /> Login
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-navy-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-navy-menu">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`mobile-navy-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-navy-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="mobile-nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
          <div className="mobile-navy-divider"></div>
          {user ? (
            <button onClick={handleLogout} className="mobile-navy-logout">
              <FiLogOut /> Logout
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/register')} className="mobile-navy-register">
                Register
              </button>
              <button onClick={() => navigate('/login')} className="mobile-navy-login">
                <FiLogIn /> Login
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;