import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7765",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("hms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginCall = err.config?.url?.includes("/auth/login");
    if (!isLoginCall && err.response?.status === 401) {
      sessionStorage.removeItem("hms_token");
      sessionStorage.removeItem("hms_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;