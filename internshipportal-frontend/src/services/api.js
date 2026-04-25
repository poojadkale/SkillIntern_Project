import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',  // Make sure this is correct
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add this to see API calls in console
API.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

API.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    const message = error.response?.data?.message || 'Something went wrong';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default API;