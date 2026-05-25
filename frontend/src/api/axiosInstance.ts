import axios from 'axios';

const apiUrl = process.env.VITE_API_URL || 'http://localhost:3333';

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
