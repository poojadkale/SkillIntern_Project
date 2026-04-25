import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import DashboardAnalytics from './DashboardAnalytics';
import UsersManagement from './UsersManagement';
import CompaniesManagement from './CompaniesManagement';
import InternshipsManagement from './InternshipsManagement';
import ApplicationsManagement from './ApplicationsManagement';
import StudentManagement from './StudentManagement';
import AdminProfile from './AdminProfile';
import ContactMessages from './ContactMessages';
import ReportsDashboard from './ReportsDashboard';
import NotificationPage from '../common/NotificationPage';  // Add this import
import './AdminTheme.css';
import './AdminNavbar.css';
import './AdminSidebar.css';
import './DashboardAnalytics.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <div className="admin-dashboard-container">
        <AdminSidebar isOpen={sidebarOpen} />
        <div className={`admin-content ${!sidebarOpen ? 'expanded' : ''}`}>
          <Routes>
            <Route path="/" element={<DashboardAnalytics />} />
            <Route path="dashboard" element={<DashboardAnalytics />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="companies" element={<CompaniesManagement />} />
            <Route path="internships" element={<InternshipsManagement />} />
            <Route path="applications" element={<ApplicationsManagement />} />
            <Route path="contact-messages" element={<ContactMessages />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="notifications" element={<NotificationPage />} />  {/* Add this route */}
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;