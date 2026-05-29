import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, Calendar, Droplet, Edit, Clock } from "lucide-react";
import { patientService } from "../../services/patient.service";
import Loader from "../../components/ui/Loader";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import { STATUS_COLORS } from "../../utils/constants";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: patient, isLoading } = useQuery({ queryKey: ["patient", id], queryFn: () => patientService.getById(id).then(r => r.data.data) });
  const { data: history } = useQuery({ queryKey: ["patient-history", id], queryFn: () => patientService.getHistory(id).then(r => r.data.data) });

  if (isLoading) return <Loader text="Loading patient..." />;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <h2 className="text-xl font-bold text-gray-900">Patient Profile</h2>
        </div>
        <button onClick={() => navigate("/patients/" + id + "/edit")} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"><Edit size={16} />Edit</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-3">
              {patient.photo ? <img src={patient.photo} className="w-20 h-20 rounded-full object-cover" /> : <span className="text-primary-600 text-3xl font-bold">{patient.name[0]}</span>}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-400">{patient.patientId}</p>
            <Badge variant={patient.gender === "male" ? "info" : "purple"} className="mt-2">{patient.gender}</Badge>
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {patient.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} className="text-gray-400" />{patient.phone}</div>}
            {patient.email && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} className="text-gray-400" />{patient.email}</div>}
            {patient.dateOfBirth && <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar size={14} className="text-gray-400" />{formatDate(patient.dateOfBirth)}</div>}
            {patient.bloodGroup !== "unknown" && <div className="flex items-center gap-2 text-sm text-red-500"><Droplet size={14} />{patient.bloodGroup}</div>}
          </div>
          {(patient.allergies?.length > 0 || patient.chronicConditions?.length > 0) && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {patient.allergies?.length > 0 && <div><p className="text-xs font-semibold text-red-600 mb-1">Allergies</p><div className="flex flex-wrap gap-1">{patient.allergies.map(a => <span key={a} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{a}</span>)}</div></div>}
              {patient.chronicConditions?.length > 0 && <div><p className="text-xs font-semibold text-orange-600 mb-1">Chronic Conditions</p><div className="flex flex-wrap gap-1">{patient.chronicConditions.map(c => <span key={c} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{c}</span>)}</div></div>}
            </div>
          )}
        </Card>

        {/* History */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock size={16} className="text-primary-500" />Recent Appointments ({history?.appointments?.length || 0})</h3>
            {history?.appointments?.length === 0 ? <p className="text-sm text-gray-400">No appointments yet</p> : (
              <div className="space-y-2">
                {history?.appointments?.slice(0, 5).map(appt => (
                  <div key={appt._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div><p className="text-sm font-medium text-gray-800">{formatDate(appt.date)}</p><p className="text-xs text-gray-400">{appt.timeSlot?.start} · {appt.reason || "General checkup"}</p></div>
                    <Badge variant={appt.status === "completed" ? "success" : appt.status === "cancelled" ? "danger" : "info"}>{appt.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Prescriptions ({history?.prescriptions?.length || 0})</h3>
            {history?.prescriptions?.length === 0 ? <p className="text-sm text-gray-400">No prescriptions yet</p> : (
              <div className="space-y-2">
                {history?.prescriptions?.slice(0, 3).map(rx => (
                  <div key={rx._id} className="py-2 border-b border-gray-50 last:border-0">
                    <p className="text-sm font-medium text-gray-800">{formatDate(rx.date)}</p>
                    <p className="text-xs text-gray-400">{rx.medicines?.length} medicines prescribed</p>
                    {rx.pdfUrl && <a href={rx.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">View PDF</a>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Payment History ({history?.payments?.length || 0})</h3>
            {history?.payments?.length === 0 ? <p className="text-sm text-gray-400">No payments yet</p> : (
              <div className="space-y-2">
                {history?.payments?.slice(0, 5).map(pay => (
                  <div key={pay._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div><p className="text-sm font-medium">{formatDate(pay.createdAt)}</p><p className="text-xs text-gray-400">{pay.receiptNumber}</p></div>
                    <div className="text-right"><p className="text-sm font-semibold">{formatCurrency(pay.totalAmount)}</p><Badge variant={pay.status === "paid" ? "success" : pay.status === "partial" ? "warning" : "danger"}>{pay.status}</Badge></div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
