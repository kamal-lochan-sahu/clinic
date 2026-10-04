import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

// The session is restored in main.jsx before the app renders, so no loading delay is needed here.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
