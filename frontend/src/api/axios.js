import axios from "axios";

const rawBaseURL = (import.meta.env.VITE_API_URL || "/api").trim();
const normalizedBaseURL = rawBaseURL.replace(/\/+$/, "");
const apiBaseURL = normalizedBaseURL.endsWith("/api")
  ? normalizedBaseURL
  : `${normalizedBaseURL}/api`;

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("owner");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;