import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";
import { useAuthStore } from "./store/authStore";
import axios from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

// Restore session on hard refresh using refresh token cookie
const restoreSession = async () => {
  const { isAuthenticated, setAccessToken, login, logout } = useAuthStore.getState();

  // If already has token in memory, skip
  if (isAuthenticated && useAuthStore.getState().accessToken) return;

  // Try to get new access token using refresh token cookie
  try {
    const { data } = await axios.post(
      (import.meta.env.VITE_API_URL || "/api") + "/auth/refresh-token",
      {},
      { withCredentials: true }
    );
    if (data.data.accessToken) {
      setAccessToken(data.data.accessToken);
      // Also fetch user data
      const userRes = await axios.get(
        (import.meta.env.VITE_API_URL || "/api") + "/auth/me",
        {
          withCredentials: true,
          headers: { Authorization: "Bearer " + data.data.accessToken }
        }
      );
      if (userRes.data.data) {
        login(userRes.data.data, data.data.accessToken);
      }
    }
  } catch {
    // Refresh token expired or not found — user needs to login
    logout();
  }
};

// Restore session before rendering
restoreSession().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </QueryClientProvider>
    </React.StrictMode>
  );
});
