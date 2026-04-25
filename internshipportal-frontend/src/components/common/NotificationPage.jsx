// src/components/common/NotificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiBell, FiMail, FiCheckCircle, FiMessageSquare, FiArrowLeft, FiClock, FiEye, FiBriefcase, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import './NotificationPage.css';

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications/user/${user.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read/${user.id}`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all/${user.id}`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    if (type?.includes('CONTACT')) return <FiMail className="notif-icon contact" />;
    if (type?.includes('APPLICATION')) return <FiCheckCircle className="notif-icon application" />;
    if (type?.includes('INTERNSHIP')) return <FiBriefcase className="notif-icon internship" />;
    if (type?.includes('PROFILE')) return <FiUser className="notif-icon profile" />;
    return <FiBell className="notif-icon default" />;
  };

  const formatDate = (dateString) => {
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

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getBackLink = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'COMPANY') return '/company/dashboard';
    return '/student/dashboard';
  };

  if (loading) {
    return (
      <div className="notification-page-loading">
        <div className="spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notification-page">
      <div className="notification-page-header">
        <Link to={getBackLink()} className="back-link">
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <h1>Notifications</h1>
        <p>Stay updated with your latest activities</p>
      </div>

      <div className="notification-page-stats">
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <h3>{notifications.length}</h3>
            <p>Total Notifications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <h3>{unreadCount}</h3>
            <p>Unread</p>
          </div>
        </div>
      </div>

      <div className="notification-page-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Notifications
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread Only
          </button>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-page-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <FiBell className="no-notif-icon" />
            <h3>No notifications yet</h3>
            <p>When you receive notifications, they will appear here</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-page-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="notification-page-icon">
                {getNotificationIcon(notif.type)}
              </div>
              <div className="notification-page-content">
                <div className="notification-page-title">{notif.title}</div>
                <div className="notification-page-message">{notif.message}</div>
                <div className="notification-page-time">
                  <FiClock /> {formatDate(notif.createdAt)}
                </div>
              </div>
              {!notif.read && <div className="notification-page-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;