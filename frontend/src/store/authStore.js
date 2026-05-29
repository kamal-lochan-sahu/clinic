import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      login: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "medimanage-auth",
      // SECURITY FIX: Only persist user info, NOT the token
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // accessToken intentionally excluded — use httpOnly cookie instead
      }),
    }
  )
);
