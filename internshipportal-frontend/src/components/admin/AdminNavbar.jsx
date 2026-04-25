import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiLogOut, FiUser, FiSettings, FiChevronDown } from 'react-icons/fi';
import './AdminNavbar.css';

const AdminNavbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <h1 className="navbar-title">Admin Dashboard</h1>
      </div>
      
      <div className="navbar-right">
        <div className="admin-info">
          <div className="admin-details">
            <span className="admin-name">{user?.fullName || 'Admin User'}</span>
            <span className="admin-email">{user?.email}</span>
          </div>
          <div className="admin-avatar" onClick={() => setShowDropdown(!showDropdown)}>
            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            <FiChevronDown className="dropdown-icon" />
          </div>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => navigate('/admin/profile')}>
                <FiUser /> My Profile
              </div>
              <div className="dropdown-item" onClick={() => navigate('/admin/settings')}>
                <FiSettings /> Settings
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;