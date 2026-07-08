import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("hms_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes("/auth/login");

    if (!isLoginCall && error.response?.status === 401) {
      sessionStorage.removeItem("hms_token");
      sessionStorage.removeItem("hms_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;
