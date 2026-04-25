import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';
import HomePage from './components/home/HomePage';
import PublicCompanies from './components/public/PublicCompanies';
import PublicInternships from './components/public/PublicInternships';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RegisterStudent from './components/auth/RegisterStudent';
import RegisterCompany from './components/auth/RegisterCompany';
import CompanyDashboard from './components/company/CompanyDashboard';
import CompanyProfile from './components/company/CompanyProfile';
import CompanyApplications from './components/company/CompanyApplications';
import CompanyMessages from './components/company/CompanyMessages';
import StudentDashboard from './components/student/StudentDashboard';
import StudentProfile from './components/student/StudentProfile';
import StudentApplications from './components/student/StudentApplications';
import StudentCompanies from './components/student/StudentCompanies';
import StudentInternships from './components/student/StudentInternships';
import MyMessages from './components/student/MyMessages';
import ContactUs from './components/common/ContactUs';
import AboutUs from './components/common/AboutUs';
import AdminDashboard from './components/admin/AdminDashboard';
import NotificationPage from './components/common/NotificationPage';
import Footer from './components/common/Footer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <div className="main-content">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#2ecc71',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#e74c3c',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/student" element={<RegisterStudent />} />
            <Route path="/register/company" element={<RegisterCompany />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/companies" element={<PublicCompanies />} />
            <Route path="/internships" element={<PublicInternships />} />
            
            {/* Student Routes - Use relative paths */}
            <Route path="/student" element={<PrivateRoute role="STUDENT" />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="applications" element={<StudentApplications />} />
              <Route path="companies" element={<StudentCompanies />} />
              <Route path="internships" element={<StudentInternships />} />
              <Route path="messages" element={<MyMessages />} />
              <Route path="notifications" element={<NotificationPage />} />
            </Route>
            
            {/* Company Routes - Use relative paths */}
            <Route path="/company" element={<PrivateRoute role="COMPANY" />}>
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="profile" element={<CompanyProfile />} />
              <Route path="applications" element={<CompanyApplications />} />
              <Route path="messages" element={<CompanyMessages />} />
              <Route path="notifications" element={<NotificationPage />} />
            </Route>

            {/* Admin Routes - Add notification route inside AdminDashboard */}
            <Route path="/admin/*" element={<PrivateRoute role="ADMIN" />}>
              <Route path="*" element={<AdminDashboard />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;