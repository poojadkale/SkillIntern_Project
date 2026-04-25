import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Stored user from localStorage:', storedUser);
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log('Parsed user data:', userData);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      
      const userData = {
        userId: response.userId,
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        phone: response.phone || ''  // Add phone number to user data
      };
      
      console.log('Setting user data:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Verify storage
      const stored = localStorage.getItem('user');
      console.log('Stored in localStorage:', stored);
      
      toast.success(`Welcome back, ${userData.fullName}!`);
      
      // Role-based navigation after login
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else if (userData.role === 'COMPANY') {
        navigate('/company/dashboard');
      } else if (userData.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/');
      }
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      console.log('Register response:', response);
      
      const message = response.message || 'Registration successful! You can now login.';
      
      toast.success(message);
      navigate('/login');
      
      return { success: true, message: message };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const updateUser = async (updatedUserData) => {
    try {
      // Update localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        const newUser = { ...currentUser, ...updatedUserData };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        toast.success('Profile updated successfully');
      } else {
        setUser(updatedUserData);
      }
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/'); // Redirect to home page after logout
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,  
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isCompany: user?.role === 'COMPANY',
    isStudent: user?.role === 'STUDENT'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};