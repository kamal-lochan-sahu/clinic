import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useUIStore } from "../../store/uiStore";
import { clsx } from "clsx";

const pageTitles = {
  "/": "Dashboard",
  "/patients": "Patients",
  "/appointments": "Appointments",
  "/queue": "Queue Management",
  "/opd": "OPD Consultation",
  "/labtests": "Lab Tests",
  "/medicines": "Medicine Inventory",
  "/billing": "Billing & Payments",
  "/staff": "Staff Management",
  "/expenses": "Expenses",
  "/analytics": "Analytics & Reports",
  "/settings": "Settings",
};

export default function Layout() {
  const { sidebarOpen } = useUIStore();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "MediManage";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={clsx("transition-all duration-300", sidebarOpen ? "ml-60" : "ml-16")}>
        <Navbar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
