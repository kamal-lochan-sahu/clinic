import axios from "axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post("/api/auth/refresh-token", {}, { withCredentials: true });
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        original.headers.Authorization = "Bearer " + data.data.accessToken;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    const message = error.response?.data?.message || "Something went wrong";
    if (error.response?.status !== 401) toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
