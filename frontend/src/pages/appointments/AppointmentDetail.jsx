import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, User, Phone, Edit } from "lucide-react";
import { appointmentService } from "../../services/appointment.service";
import Loader from "../../components/ui/Loader";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatDate, formatTime } from "../../utils/formatDate";
import toast from "react-hot-toast";

const statusConfig = {
  scheduled: { label: "Scheduled", variant: "info" },
  confirmed: { label: "Confirmed", variant: "success" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  noshow: { label: "No Show", variant: "gray" },
};

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointmentService.getById(id).then(r => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => appointmentService.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", id] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Status updated!");
    },
  });

  if (isLoading) return <Loader text="Loading appointment..." />;
  if (!appointment) return <div className="text-center py-12 text-gray-500">Appointment not found</div>;

  const cfg = statusConfig[appointment.status] || statusConfig.scheduled;
  const patient = appointment.patientId;
  const doctor = appointment.doctorId;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
        </div>
        <Badge variant={cfg.variant} className="text-sm px-3 py-1">{cfg.label}</Badge>
      </div>

      {/* Appointment Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-700">Appointment Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center"><Calendar size={16} className="text-primary-600" /></div>
            <div><p className="text-xs text-gray-400">Date</p><p className="text-sm font-semibold">{formatDate(appointment.date)}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center"><Clock size={16} className="text-primary-600" /></div>
            <div><p className="text-xs text-gray-400">Time</p><p className="text-sm font-semibold">{appointment.timeSlot?.start} — {appointment.timeSlot?.end}</p></div>
          </div>
          <div>
            <p className="text-xs text-gray-400">Token No.</p>
            <p className="text-sm font-semibold">#{appointment.tokenNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Type</p>
            <p className="text-sm font-semibold capitalize">{appointment.type}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400">Reason</p>
            <p className="text-sm font-semibold">{appointment.reason || "General checkup"}</p>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      {patient && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <h3 className="font-semibold text-gray-700">Patient</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-lg">{patient.name?.[0]}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{patient.name}</p>
              <p className="text-sm text-gray-500">{patient.patientId}</p>
            </div>
            <button onClick={() => navigate("/patients/" + patient._id)}
              className="text-sm text-primary-600 hover:underline font-medium">View Profile</button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} className="text-gray-400" />{patient.phone}
          </div>
          {patient.allergies?.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-600 mb-1">⚠️ Allergies</p>
              <p className="text-sm text-red-700">{patient.allergies.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {/* Update Status */}
      {appointment.status !== "completed" && appointment.status !== "cancelled" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-700 mb-3">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "confirmed", label: "Confirm", variant: "success" },
              { value: "completed", label: "Mark Complete", variant: "success" },
              { value: "noshow", label: "No Show", variant: "warning" },
              { value: "cancelled", label: "Cancel", variant: "danger" },
            ].filter(s => s.value !== appointment.status).map(s => (
              <button key={s.value}
                onClick={() => updateStatus.mutate({ id: appointment._id, status: s.value })}
                className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " +
                  (s.variant === "success" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                   s.variant === "danger" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                   "bg-yellow-100 text-yellow-700 hover:bg-yellow-200")}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start Consultation */}
      {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
        <Button onClick={() => navigate("/opd/consultation/" + patient?._id)} className="w-full justify-center">
          Start OPD Consultation
        </Button>
      )}
    </div>
  );
}
