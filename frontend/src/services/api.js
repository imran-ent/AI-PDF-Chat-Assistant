import axios from "axios";

// Use env var for production, fallback to localhost
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  timeout: 60000, // 60s for embedding + gemini
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging (dev)
api.interceptors.request.use(
  (config) => {
    // Remove content-type for FormData (browser will set boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Unexpected error";
    // Attach friendly message
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export default api;
export { baseURL };
