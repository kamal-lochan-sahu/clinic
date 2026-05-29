import { useNavigate } from "react-router-dom";
import { Phone, Calendar, Droplet, ChevronRight } from "lucide-react";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/formatDate";

export default function PatientCard({ patient }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate("/patients/" + patient._id)} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          {patient.photo ? <img src={patient.photo} alt={patient.name} className="w-12 h-12 rounded-full object-cover" /> : <span className="text-primary-600 font-bold text-lg">{patient.name[0]}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate">{patient.name}</h3>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{patient.patientId}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={11} />{patient.phone}</span>
            <Badge variant={patient.gender === "male" ? "info" : patient.gender === "female" ? "purple" : "gray"}>{patient.gender}</Badge>
            {patient.bloodGroup !== "unknown" && <span className="flex items-center gap-1 text-xs text-red-500"><Droplet size={11} />{patient.bloodGroup}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
