import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Ajusta el puerto según levantes Laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adjuntar el Bearer Token si el usuario está logueado
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imta_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;