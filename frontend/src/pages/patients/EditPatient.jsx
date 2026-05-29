import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { patientService } from "../../services/patient.service";
import { useUpdatePatient } from "../../hooks/usePatients";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { BLOOD_GROUPS, GENDERS } from "../../utils/constants";

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const updatePatient = useUpdatePatient();

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => patientService.getById(id).then(r => r.data.data),
  });

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        address: patient.address,
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "",
        notes: patient.notes,
        allergiesText: patient.allergies?.join(", "),
        chronicText: patient.chronicConditions?.join(", "),
        medicationsText: patient.currentMedications?.join(", "),
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      allergies: data.allergiesText ? data.allergiesText.split(",").map(s => s.trim()).filter(Boolean) : [],
      chronicConditions: data.chronicText ? data.chronicText.split(",").map(s => s.trim()).filter(Boolean) : [],
      currentMedications: data.medicationsText ? data.medicationsText.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      await updatePatient.mutateAsync({ id, data: payload });
      navigate("/patients/" + id);
    } catch {}
  };

  if (isLoading) return <Loader text="Loading patient..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-bold text-gray-900">Edit Patient</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name *" placeholder="Patient full name"
              {...register("name", { required: "Name required" })} error={errors.name?.message} />
            <Input label="Phone *" placeholder="10 digit mobile"
              {...register("phone", { required: "Phone required", pattern: { value: /^[0-9+]{10,13}$/, message: "Valid phone required" } })}
              error={errors.phone?.message} />
            <Input label="Email" type="email" placeholder="patient@email.com" {...register("email")} />
            <Input label="Date of Birth" type="date" {...register("dateOfBirth")} />
            <Select label="Gender *" options={GENDERS.map(g => ({ value: g, label: g.charAt(0).toUpperCase() + g.slice(1) }))}
              placeholder="Select gender" {...register("gender", { required: true })} />
            <Select label="Blood Group" options={BLOOD_GROUPS.map(b => ({ value: b, label: b }))}
              placeholder="Select blood group" {...register("bloodGroup")} />
          </div>
          <Input label="Address" placeholder="Full address" {...register("address")} />
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Medical History</h3>
          <Input label="Allergies (comma separated)" placeholder="Penicillin, Aspirin" {...register("allergiesText")} />
          <Input label="Chronic Conditions (comma separated)" placeholder="Diabetes, Hypertension" {...register("chronicText")} />
          <Input label="Current Medications (comma separated)" placeholder="Metformin 500mg" {...register("medicationsText")} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} {...register("notes")} />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={updatePatient.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
