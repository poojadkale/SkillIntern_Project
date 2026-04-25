// src/services/authService.js
import api from './api';

const authService = {
  // Set auth token for API requests
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      console.log('Sending login request to:', '/auth/login');
      console.log('Request data:', { email, password });
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('Login response:', response.data);
      
      // Ensure phone number is included in the response
      const loginData = {
        userId: response.data.userId || response.data.id,
        id: response.data.userId || response.data.id,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role,
        phone: response.data.phone || ''  // Add phone number field
      };
      
      // Auto-set token if received
      if (response.data.token) {
        authService.setAuthToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      }
      
      return loginData;
    } catch (error) {
      console.error('Login API error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      throw error;
    }
  },

  // Register user (student or company) - Auto-approve on frontend
  register: async (userData) => {
    try {
      // Add auto-approval flags to the request
      const registrationData = {
        ...userData,
        status: 'APPROVED',
        approved: true,
        isApproved: true,
        approvalStatus: 'APPROVED'
      };
      
      console.log('Sending registration request with auto-approval:', registrationData);
      
      const response = await api.post('/auth/register', registrationData);
      
      console.log('Registration response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      
      // If backend doesn't accept approval fields, try without them
      if (error.response?.status === 400) {
        console.log('Backend may not support approval fields, trying without them...');
        try {
          const response = await api.post('/auth/register', userData);
          return response.data;
        } catch (retryError) {
          console.error('Retry registration failed:', retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  },

  // Register admin (optional)
  registerAdmin: async (adminData) => {
    try {
      const response = await api.post('/auth/register/admin', adminData);
      const data = response.data;
      
      console.log('Admin registration response:', data);
      
      if (data.userId) {
        const token = btoa(`${data.email}:${Date.now()}`);
        localStorage.setItem('token', token);
        authService.setAuthToken(token);
        
        return {
          userId: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          phone: data.phone || '',
          token: token
        };
      }
      
      return data;
    } catch (error) {
      console.error('Admin registration error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Change password (authenticated)
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },
  
  // Check if user is approved (for backward compatibility)
  isUserApproved: (user) => {
    return true;
  },
  
  // Get user approval status (for backward compatibility)
  getApprovalStatus: async (userId, role) => {
    return { status: 'APPROVED', approved: true };
  }
};

export default authService;