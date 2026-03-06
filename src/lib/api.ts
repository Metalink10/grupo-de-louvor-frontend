import axios from 'axios';

export const api = axios.create({
  baseURL:process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
})