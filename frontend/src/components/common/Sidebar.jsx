import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Clock, Stethoscope, FlaskConical, Pill, CreditCard, UserCog, Receipt, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { clsx } from "clsx";
import { canAccess } from "../../utils/roles";
import api from "../../services/api";
import toast from "react-hot-toast";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patients", icon: Users, label: "Patients" },
  { to: "/appointments", icon: Calendar, label: "Appointments" },
  { to: "/queue", icon: Clock, label: "Queue" },
  { to: "/opd", icon: Stethoscope, label: "OPD / Consultation" },
  { to: "/labtests", icon: FlaskConical, label: "Lab Tests" },
  { to: "/medicines", icon: Pill, label: "Medicines" },
  { to: "/billing", icon: CreditCard, label: "Billing" },
  { to: "/staff", icon: UserCog, label: "Staff" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <aside className={clsx("fixed left-0 top-0 h-full bg-white border-r border-gray-100 shadow-sm z-40 flex flex-col transition-all duration-300", sidebarOpen ? "w-60" : "w-16")}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Activity size={18} className="text-white" />
        </div>
        {sidebarOpen && <span className="font-bold text-gray-900 text-lg truncate">{user?.branding?.clinicName || "MediManage"}</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.filter(({ to }) => canAccess(user?.role, to)).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => clsx("flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-colors text-sm font-medium", isActive ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-4">
        {sidebarOpen && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors">
          <LogOut size={16} />
          {sidebarOpen && "Logout"}
        </button>
      </div>

      {/* Toggle */}
      <button onClick={toggleSidebar} className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
