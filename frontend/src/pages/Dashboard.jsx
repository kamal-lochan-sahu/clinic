import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, IndianRupee, Clock, FlaskConical, Pill, TrendingUp, AlertTriangle } from "lucide-react";
import { analyticsService } from "../services/analytics.service";
import { useAuthStore } from "../store/authStore";
import StatsCard from "../components/ui/StatsCard";
import Loader from "../components/ui/Loader";
import { formatCurrency } from "../utils/formatCurrency";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => analyticsService.getDashboard().then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: revenue } = useQuery({
    queryKey: ["revenue", "month"],
    queryFn: () => analyticsService.getRevenue("month").then((r) => r.data.data),
  });

  if (isLoading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Good morning, {user?.name?.split(" ")[0]}! 👋</h2>
        <p className="text-primary-100 mt-1">Here is what is happening at {user?.branding?.clinicName} today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="xl:col-span-2">
          <StatsCard title="Today's Appointments" value={stats?.todayAppointments || 0} subtitle={stats?.todayCompleted + " completed"} icon={Calendar} color="blue" />
        </div>
        <div className="xl:col-span-2">
          <StatsCard title="Total Patients" value={stats?.totalPatients || 0} icon={Users} color="green" />
        </div>
        <div className="xl:col-span-2">
          <StatsCard title="Today's Revenue" value={formatCurrency(stats?.todayRevenue || 0)} icon={IndianRupee} color="purple" />
        </div>
        <div className="xl:col-span-2">
          <StatsCard title="Pending Appointments" value={stats?.pendingAppointments || 0} icon={Clock} color="orange" />
        </div>
        <div className="xl:col-span-2">
          <StatsCard title="Low Stock Medicines" value={stats?.lowStockMedicines || 0} icon={Pill} color={stats?.lowStockMedicines > 0 ? "red" : "green"} />
        </div>
      </div>

      {/* Alerts */}
      {stats?.lowStockMedicines > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{stats.lowStockMedicines} medicines are low on stock</p>
          </div>
          <button onClick={() => navigate("/medicines")} className="text-sm text-red-600 font-medium hover:underline">View</button>
        </div>
      )}

      {/* Revenue Chart */}
      {revenue && revenue.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary-500" />Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => ["Rs." + v, "Revenue"]} />
              <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: "#0ea5e9", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "New Patient", icon: Users, path: "/patients/new", color: "bg-blue-500" },
          { label: "Book Appointment", icon: Calendar, path: "/appointments/new", color: "bg-green-500" },
          { label: "OPD / Consult", icon: FlaskConical, path: "/opd", color: "bg-purple-500" },
          { label: "Create Bill", icon: IndianRupee, path: "/billing/new", color: "bg-orange-500" },
        ].map((action) => (
          <button key={action.path} onClick={() => navigate(action.path)} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:shadow-md transition-all flex flex-col items-center gap-3">
            <div className={"w-12 h-12 rounded-xl flex items-center justify-center " + action.color}>
              <action.icon size={22} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
