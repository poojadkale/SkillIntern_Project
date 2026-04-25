import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiSettings,
  FiBarChart2,
  FiUserCheck,
  FiMail,
  FiUserPlus,
  FiBell
} from 'react-icons/fi';
import NotificationBell from '../common/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count for sidebar bell
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(`/notifications/count/${user.id}`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const menuItems = [
    { path: '/admin', icon: <FiBarChart2 />, label: 'Dashboard', end: true },
    { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { path: '/admin/students', icon: <FiUserCheck />, label: 'Students' },
    { path: '/admin/companies', icon: <FiBriefcase />, label: 'Companies' },
    { path: '/admin/internships', icon: <FiFileText />, label: 'Internships' },
    { path: '/admin/applications', icon: <FiSettings />, label: 'Applications' },
    { path: '/admin/contact-messages', icon: <FiMail />, label: 'Contact Messages' },
    { path: '/admin/reports', icon: <FiBarChart2 />, label: 'Reports' },
  ];

  return (
    <div className={`admin-sidebar ${!isOpen ? 'closed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          <h2>{isOpen ? 'Admin Panel' : 'AP'}</h2>
          {/* Notification Bell next to Admin Panel */}
          <div className="sidebar-header-bell">
            <NotificationBell userId={user?.id} />
          </div>
        </div>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.end}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={!isOpen ? item.label : ''}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {isOpen && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;