import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { patientService } from "../../services/patient.service";
import { consultationService } from "../../services/consultation.service";
import { prescriptionService } from "../../services/prescription.service";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import MedicineAutoSuggest from "../../components/prescription/MedicineAutoSuggest";
import { ArrowLeft, Plus, Trash2, FileText, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Consultation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId).then(r => r.data.data),
  });

  const { register, handleSubmit, control, setValue } = useForm({
    defaultValues: {
      medicines: [{ name: "", dosage: "", frequency: "", duration: "", timing: "after_food", instructions: "" }]
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

  const createConsultation = useMutation({ mutationFn: consultationService.create });
  const createPrescription = useMutation({ mutationFn: prescriptionService.create });

  const onSubmit = async (data) => {
    try {
      const consultation = await createConsultation.mutateAsync({
        patientId, doctorId: user._id,
        vitals: {
          bp: data.bp,
          temperature: data.temperature ? +data.temperature : undefined,
          weight: data.weight ? +data.weight : undefined,
          height: data.height ? +data.height : undefined,
          pulse: data.pulse ? +data.pulse : undefined,
          spo2: data.spo2 ? +data.spo2 : undefined,
        },
        chiefComplaint: data.chiefComplaint,
        diagnosis: data.diagnosis ? data.diagnosis.split(",").map(d => d.trim()).filter(Boolean) : [],
        clinicalNotes: data.clinicalNotes,
        followUpDate: data.followUpDate || undefined,
      });

      const validMedicines = data.medicines.filter(m => m.name?.trim());
      if (validMedicines.length > 0) {
        const rx = await createPrescription.mutateAsync({
          consultationId: consultation.data.data._id,
          patientId,
          medicines: validMedicines,
          advice: data.advice,
          nextVisit: data.followUpDate || undefined,
        });
        const pdfUrl = rx?.data?.data?.pdfUrl;
        if (pdfUrl) {
          toast.success("Consultation saved! Prescription PDF ready.");
          if (window.confirm("Prescription generated! Download PDF?")) {
            window.open(pdfUrl, "_blank");
          }
        } else {
          toast.success("Consultation saved! Prescription generated.");
        }
      } else {
        toast.success("Consultation saved!");
      }
      navigate("/patients/" + patientId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save consultation");
    }
  };

  if (isLoading) return <Loader text="Loading patient..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">OPD Consultation</h2>
          <p className="text-sm text-gray-500">{patient?.name} · {patient?.patientId}</p>
        </div>
      </div>

      {/* Allergy Warning */}
      {patient?.allergies?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Allergies: {patient.allergies.join(", ")}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Vitals */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Input label="BP (mmHg)" placeholder="120/80" {...register("bp")} />
            <Input label="Temperature (°F)" type="number" step="0.1" min="90" max="110" placeholder="98.6" {...register("temperature")} />
            <Input label="Pulse (bpm)" type="number" min="40" max="200" placeholder="72" {...register("pulse")} />
            <Input label="SpO2 (%)" type="number" min="70" max="100" placeholder="99" {...register("spo2")} />
            <Input label="Weight (kg)" type="number" step="0.1" placeholder="70" {...register("weight")} />
            <Input label="Height (cm)" type="number" placeholder="170" {...register("height")} />
          </div>
        </Card>

        {/* Complaint & Diagnosis */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Complaint & Diagnosis</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint *</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={2} placeholder="Patient main complaint..." {...register("chiefComplaint", { required: true })} />
          </div>
          <Input label="Diagnosis (comma separated)" placeholder="Common Cold, Pharyngitis" {...register("diagnosis")} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes (Private)</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={2} placeholder="Private doctor notes..." {...register("clinicalNotes")} />
          </div>
        </Card>

        {/* Prescription */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={16} className="text-primary-500" />Prescription (Rx)
            </h3>
            <Button type="button" size="sm" variant="secondary"
              onClick={() => append({ name: "", dosage: "", frequency: "", duration: "", timing: "after_food", instructions: "" })}>
              <Plus size={14} />Add Medicine
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Medicine {index + 1}</span>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Medicine Name with Auto-Suggest */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Medicine Name</label>
                  <Controller
                    name={"medicines." + index + ".name"}
                    control={control}
                    render={({ field: f }) => (
                      <MedicineAutoSuggest
                        value={f.value}
                        onChange={f.onChange}
                        placeholder="Type to search inventory..."
                      />
                    )}
                  />
                </div>
                <Input placeholder="Dosage (500mg)" {...register("medicines." + index + ".dosage")} />
                <Input placeholder="Frequency (1-0-1)" {...register("medicines." + index + ".frequency")} />
                <Input placeholder="Duration (5 days)" {...register("medicines." + index + ".duration")} />
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register("medicines." + index + ".timing")}>
                  <option value="before_food">Before Food</option>
                  <option value="after_food">After Food</option>
                  <option value="with_food">With Food</option>
                  <option value="empty_stomach">Empty Stomach</option>
                  <option value="any">Any Time</option>
                </select>
                <Input placeholder="Special instructions" {...register("medicines." + index + ".instructions")} />
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Advice to Patient</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={2} placeholder="Dietary advice, rest, activity restrictions..." {...register("advice")} />
          </div>
          <Input label="Follow-up Date" type="date" {...register("followUpDate")} min={new Date().toISOString().split("T")[0]} />
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={createConsultation.isPending || createPrescription.isPending}>
            Save & Generate Prescription
          </Button>
        </div>
      </form>
    </div>
  );
}
