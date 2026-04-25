// src/services/adminService.js
import api from './api';

export const adminService = {
  // Dashboard Statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // User Management
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Company Management
  getAllCompanies: async () => {
    try {
      const response = await api.get('/admin/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  getCompanyById: async (companyId) => {
    try {
      const response = await api.get(`/admin/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  },

  deleteCompany: async (companyId) => {
    try {
      const response = await api.delete(`/admin/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  // Student Management
  getAllStudents: async () => {
    try {
      const response = await api.get('/admin/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  getAllStudentsWithDetails: async () => {
    try {
      const response = await api.get('/admin/students/details');
      return response.data;
    } catch (error) {
      console.error('Error fetching students with details:', error);
      throw error;
    }
  },

  getStudentById: async (studentId) => {
    try {
      const response = await api.get(`/admin/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  getStudentCompleteDetails: async (studentId) => {
    try {
      const response = await api.get(`/admin/students/${studentId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student complete details:', error);
      throw error;
    }
  },

  deleteStudent: async (studentId) => {
    try {
      const response = await api.delete(`/admin/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Internship Management
  getAllInternships: async () => {
    try {
      const response = await api.get('/admin/internships');
      return response.data;
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  },

  getInternshipById: async (internshipId) => {
    try {
      const response = await api.get(`/admin/internships/${internshipId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching internship:', error);
      throw error;
    }
  },

  updateInternshipStatus: async (internshipId, status) => {
    try {
      const response = await api.patch(`/admin/internships/${internshipId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating internship status:', error);
      throw error;
    }
  },

  deleteInternship: async (internshipId) => {
    try {
      const response = await api.delete(`/admin/internships/${internshipId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting internship:', error);
      throw error;
    }
  },

  // Application Management
  getAllApplications: async () => {
    try {
      const response = await api.get('/admin/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  getApplicationById: async (applicationId) => {
    try {
      const response = await api.get(`/admin/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  updateApplicationStatus: async (applicationId, status, comments = '') => {
    try {
      const response = await api.put(`/admin/applications/${applicationId}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  deleteApplication: async (applicationId) => {
    try {
      const response = await api.delete(`/admin/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },

  // Reports (if implemented)
  getReports: async (type, startDate, endDate) => {
    try {
      const response = await api.get('/admin/reports', {
        params: { type, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  downloadReport: async (type, format = 'pdf') => {
    try {
      const response = await api.get(`/admin/reports/download`, {
        params: { type, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  },

  // Download resume
  downloadResume: (filename) => {
    window.open(`${api.defaults.baseURL}/download/${filename}`, '_blank');
  }
};