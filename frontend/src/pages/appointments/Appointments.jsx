import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar } from "lucide-react";
import { useAppointments } from "../../hooks/useAppointments";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";

const statusConfig = {
  scheduled: { label: "Scheduled", variant: "info" },
  confirmed: { label: "Confirmed", variant: "success" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  noshow: { label: "No Show", variant: "gray" },
};

export default function Appointments() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const { data: todayData, isLoading: todayLoading } = useAppointments({ date: today, limit: 100 });
  const { data: allData, isLoading: allLoading } = useAppointments({ status, limit: 50 });

  const todayAppts = todayData?.appointments || [];
  const allAppts = allData?.appointments || [];

  const AppointmentRow = ({ appt }) => {
    const cfg = statusConfig[appt.status] || statusConfig.scheduled;
    return (
      <div onClick={() => navigate("/appointments/" + appt._id)}
        className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 cursor-pointer rounded-xl border border-transparent hover:border-primary-100 transition-all">
        <div className="w-16 text-center flex-shrink-0">
          <p className="text-base font-bold text-primary-600">{appt.timeSlot?.start}</p>
          <p className="text-xs text-gray-400">Token #{appt.tokenNumber}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{appt.patientId?.name || "Patient"}</p>
          <p className="text-xs text-gray-400">{appt.patientId?.patientId} · {appt.reason || "General checkup"}</p>
        </div>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-500">{allData?.total || 0} total appointments</p>
        </div>
        <Button onClick={() => navigate("/appointments/new")}><Plus size={16} />Book Appointment</Button>
      </div>

      {/* TODAY */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-primary-500" />
            Today — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-600 font-medium">{todayAppts.filter(a => a.status === "completed").length} completed</span>
            <span className="text-gray-300">·</span>
            <span className="text-blue-600 font-medium">{todayAppts.filter(a => a.status === "scheduled").length} pending</span>
          </div>
        </div>
        <div className="p-3">
          {todayLoading ? <Loader /> : todayAppts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No appointments booked for today</div>
          ) : (
            <div className="space-y-1">
              {[...todayAppts].sort((a, b) => a.timeSlot?.start?.localeCompare(b.timeSlot?.start)).map(appt => (
                <AppointmentRow key={appt._id} appt={appt} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ALL */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">All Appointments</h3>
          <div className="flex gap-2">
            {[
              { value: "", label: "All" },
              { value: "scheduled", label: "Scheduled" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ].map(s => (
              <button key={s.value} onClick={() => setStatus(s.value)}
                className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (status === s.value ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3">
          {allLoading ? <Loader /> : allAppts.length === 0 ? (
            <EmptyState icon={Calendar} title="No appointments found" action={<Button onClick={() => navigate("/appointments/new")}><Plus size={16} />Book Appointment</Button>} />
          ) : (
            <div className="space-y-1">
              {allAppts.map(appt => <AppointmentRow key={appt._id} appt={appt} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
