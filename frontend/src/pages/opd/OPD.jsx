import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Plus } from "lucide-react";
import PatientSearch from "../../components/patient/PatientSearch";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function OPD() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleStartConsultation = () => {
    if (!selectedPatient) return;
    navigate("/opd/consultation/" + selectedPatient._id);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">OPD / Consultation</h2>
        <p className="text-sm text-gray-500">Search patient to start consultation</p>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Stethoscope size={18} className="text-primary-500" />Search Patient</h3>
        <PatientSearch onSelect={setSelectedPatient} />
        {selectedPatient && (
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{selectedPatient.name[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{selectedPatient.name}</p>
                <p className="text-sm text-gray-500">{selectedPatient.patientId} · {selectedPatient.phone}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {selectedPatient.allergies?.map(a => <span key={a} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">⚠️ {a}</span>)}
                </div>
              </div>
            </div>
          </div>
        )}
        <Button onClick={handleStartConsultation} disabled={!selectedPatient} className="w-full justify-center">
          <Plus size={16} />Start Consultation
        </Button>
      </Card>
    </div>
  );
}
