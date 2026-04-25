// src/services/companyService.js
import api from './api';

const companyService = {
    getTopCompanies: async () => {
        try {
            const response = await api.get('/home/companies');
            return response.data;
        } catch (error) {
            console.error('Error fetching companies:', error);
            throw error;
        }
    },

    getInternshipsByCompanyId: async (companyId) => {
        try {
            const response = await api.get(`/internships/company/${companyId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company internships:', error);
            throw error;
        }
    },

    getAllOpenInternships: async () => {
        try {
            const response = await api.get('/internships/open');
            return response.data;
        } catch (error) {
            console.error('Error fetching internships:', error);
            throw error;
        }
    },

    // FIXED: Correct endpoint for student applications
    getStudentApplications: async (studentId) => {
        try {
            // CORRECT URL: /api/applications/student/{userId}
            const response = await api.get(`/applications/student/${studentId}`);
            console.log('Applications API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            return [];
        }
    },

    getStudentProfile: async (studentId) => {
        try {
            const response = await api.get(`/student/profile/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student profile:', error);
            throw error;
        }
    },

    getCompanyInternships: async (companyId) => {
        try {
            const response = await api.get(`/internships/company/${companyId}/list`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company internships:', error);
            throw error;
        }
    },

    addInternship: async (companyId, internshipData) => {
        try {
            const formattedData = {
                ...internshipData,
                endDate: internshipData.endDate ? internshipData.endDate.split('T')[0] : null
            };
            const response = await api.post(`/internships/company/${companyId}/add`, formattedData);
            return response.data;
        } catch (error) {
            console.error('Error adding internship:', error);
            throw error;
        }
    },

    updateInternship: async (internshipId, internshipData) => {
        try {
            const formattedData = {
                ...internshipData,
                endDate: internshipData.endDate ? internshipData.endDate.split('T')[0] : null
            };
            const response = await api.put(`/internships/${internshipId}`, formattedData);
            return response.data;
        } catch (error) {
            console.error('Error updating internship:', error);
            throw error;
        }
    },

    deleteInternship: async (internshipId) => {
        try {
            const response = await api.delete(`/internships/${internshipId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting internship:', error);
            throw error;
        }
    },

    getInternshipApplications: async (internshipId) => {
        try {
            const response = await api.get(`/internships/${internshipId}/applications`);
            return response.data;
        } catch (error) {
            console.error('Error fetching internship applications:', error);
            throw error;
        }
    },

    getCompanyApplications: async (companyId) => {
        try {
            const response = await api.get(`/internships/company/${companyId}/applications`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company applications:', error);
            throw error;
        }
    },

    reviewApplication: async (applicationId, reviewData) => {
        try {
            console.log('📤 Sending review request to:', `/applications/${applicationId}/review`);
            console.log('📤 Review data:', reviewData);
            const response = await api.put(`/applications/${applicationId}/review`, reviewData, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('📥 Review response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error reviewing application:', error);
            throw error;
        }
    },

    applyForInternship: async (internshipId, studentId, applicationData, resumeFile) => {
        try {
            const formData = new FormData();
            const applicationBlob = new Blob([JSON.stringify(applicationData)], {
                type: 'application/json'
            });
            formData.append('application', applicationBlob);
            
            if (resumeFile && resumeFile instanceof File) {
                formData.append('resume', resumeFile);
            }
            
            const response = await api.post(`/applications/apply/${internshipId}/${studentId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error('Error applying for internship:', error);
            throw error;
        }
    },

    getCompanyProfile: async (companyId) => {
        try {
            const response = await api.get(`/company/profile/${companyId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching company profile:', error);
            throw error;
        }
    },

	
	updateUserProfile: async (userId, userData) => {
	    try {
	        const response = await api.put(`/users/${userId}`, userData);
	        return response.data;
	    } catch (error) {
	        console.error('Error updating user profile:', error);
	        throw error;
	    }
	},
    updateCompanyProfile: async (companyId, profileData) => {
        try {
            const response = await api.post(`/company/profile/${companyId}`, profileData);
            return response.data;
        } catch (error) {
            console.error('Error updating company profile:', error);
            throw error;
        }
    },

    updateStudentProfile: async (studentId, profileData, resumeFile) => {
        try {
            const formData = new FormData();
            const profileBlob = new Blob([JSON.stringify(profileData)], {
                type: 'application/json'
            });
            formData.append('profile', profileBlob);
            
            if (resumeFile && resumeFile instanceof File) {
                formData.append('resume', resumeFile);
            }
            
            const response = await api.post(`/student/profile/${studentId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating student profile:', error);
            throw error;
        }
    },

    // FIXED: Download resume with proper error handling and blob response
    downloadResume: async (filename) => {
        try {
            // Make sure filename is properly encoded
            const encodedFilename = encodeURIComponent(filename);
            const url = `/download/${encodedFilename}`;
            
            console.log('Downloading resume from:', url);
            
            // Make request with responseType blob to handle file download
            const response = await api.get(url, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf, application/octet-stream'
                }
            });
            
            return response;
        } catch (error) {
            console.error('Error downloading resume:', error);
            throw error;
        }
    },

    getCompanyById: async (companyId) => {
        try {
            const response = await api.get(`/companies/${companyId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching company by ID:', error);
            throw error;
        }
    },

    getStats: async () => {
        try {
            const response = await api.get('/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    },

    getFeaturedInternships: async () => {
        try {
            const response = await api.get('/internships/featured');
            return response.data;
        } catch (error) {
            console.error('Error fetching featured internships:', error);
            throw error;
        }
    },

    searchInternships: async (query) => {
        try {
            const response = await api.get(`/internships/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error('Error searching internships:', error);
            throw error;
        }
    }
};

export default companyService;