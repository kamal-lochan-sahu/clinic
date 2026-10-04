import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { canAccess } from "../../utils/roles";

// Redirects to the dashboard when the logged-in role may not open this page.
export default function RoleGuard({ page, children }) {
  const { user } = useAuthStore();
  if (!canAccess(user?.role, page)) return <Navigate to="/" replace />;
  return children;
}
