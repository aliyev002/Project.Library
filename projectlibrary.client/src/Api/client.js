import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7108/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Avtomatik JWT Token əlavə olunması
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Unauthorized və ümumi xəta idarəetməsi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Sessiya bitibsə təmizlə və loginə yönləndir
      sessionStorage.clear();
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
