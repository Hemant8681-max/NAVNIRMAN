import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {                                                                  
  const token = localStorage.getItem("sih_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sih_access_token");
      localStorage.removeItem("sih_user");
      window.dispatchEvent(new Event("sih:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export const unwrap = (response) => response.data;
export const apiError = (error) =>
  error.response?.data?.message ||
  (error.response?.status === 403
    ? "You don't have permission for this action."
    : null) ||
  (error.response?.status === 429
    ? "Too many requests. Please try again later."
    : null) ||
  (error.response?.status >= 500 ? "Server error. Please try again." : null) ||
  (!error.response ? "Unable to connect to server." : "Something went wrong.");

export default api;
