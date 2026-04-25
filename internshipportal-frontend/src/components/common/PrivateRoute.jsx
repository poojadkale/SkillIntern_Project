// components/common/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    // Redirect based on role
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin" />;
    } else if (user?.role === 'COMPANY') {
      return <Navigate to="/company/dashboard" />;
    } else if (user?.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" />;
    }
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;