import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const isOwner = user?.role === "owner";
  const isDoctor = user?.role === "doctor" || user?.role === "owner";
  const isReceptionist = ["owner", "doctor", "receptionist"].includes(user?.role);
  return { user, isAuthenticated, logout, isOwner, isDoctor, isReceptionist };
};
