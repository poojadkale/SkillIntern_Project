// src/services/homeService.js
import api from './api';

const homeService = {
  getTopCompanies: async () => {
    try {
      const response = await api.get('/home/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  },

  getFeaturedInternships: async () => {
    try {
      const response = await api.get('/home/internships/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching internships:', error);
      return [];
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/home/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { internships: 0, companies: 0, students: 0 };
    }
  }
};

export default homeService;