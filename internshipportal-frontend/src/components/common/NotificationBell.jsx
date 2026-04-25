// src/components/common/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiX, FiEye, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';
import './NotificationBell.css';

const NotificationBell = ({ userId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(`/notifications/count/${userId}`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const fetchRecentNotifications = async () => {
    setLoading(true);
    try {
      // Fetch only last 3 notifications
      const response = await api.get(`/notifications/user/${userId}/recent`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = async () => {
    if (!isOpen) {
      await fetchRecentNotifications();
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read/${userId}`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    // Navigate based on user role
    const role = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : null;
    if (role === 'ADMIN') {
      navigate('/admin/notifications');
    } else if (role === 'COMPANY') {
      navigate('/company/notifications');
    } else {
      navigate('/student/notifications');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getNotificationIcon = (type) => {
    if (type?.includes('CONTACT')) return '📧';
    if (type?.includes('APPLICATION')) return '📝';
    if (type?.includes('INTERNSHIP')) return '💼';
    if (type?.includes('PROFILE')) return '👤';
    return '🔔';
  };

  return (
    <div className="notification-container">
      <button 
        className="notification-bell" 
        onClick={toggleDropdown}
        ref={bellRef}
      >
        <FiBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown" ref={dropdownRef}>
          <div className="notification-header">
            <h3>Notifications</h3>
            <button className="close-dropdown" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              <>
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="notification-icon">
                      <span className="notif-emoji">{getNotificationIcon(notif.type)}</span>
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-message">{notif.message}</div>
                      <div className="notification-time">{formatTime(notif.createdAt)}</div>
                    </div>
                    {!notif.read && <div className="notification-dot"></div>}
                  </div>
                ))}
                
                {/* View All Link */}
                <div className="notification-view-all" onClick={handleViewAll}>
                  <FiEye /> View All Notifications <FiChevronRight />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;