import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCreatePatient } from "../../hooks/usePatients";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { BLOOD_GROUPS, GENDERS } from "../../utils/constants";

export default function AddPatient() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const createPatient = useCreatePatient();

  const onSubmit = async (data) => {
    try {
      await createPatient.mutateAsync(data);
      navigate("/patients");
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-bold text-gray-900">Register New Patient</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name *" placeholder="Patient full name" {...register("name", { required: "Name required" })} error={errors.name?.message} />
            <Input label="Phone *" placeholder="10 digit mobile number" {...register("phone", { required: "Phone required" })} error={errors.phone?.message} />
            <Input label="Email" type="email" placeholder="patient@email.com" {...register("email")} />
            <Input label="Date of Birth" type="date" {...register("dateOfBirth")} />
            <Select label="Gender *" options={GENDERS.map(g => ({ value: g, label: g.charAt(0).toUpperCase() + g.slice(1) }))} placeholder="Select gender" {...register("gender", { required: "Gender required" })} error={errors.gender?.message} />
            <Select label="Blood Group" options={BLOOD_GROUPS.map(b => ({ value: b, label: b }))} placeholder="Select blood group" {...register("bloodGroup")} />
          </div>
          <Input label="Address" placeholder="Full address" {...register("address")} />
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Medical History</h3>
          <Input label="Allergies (comma separated)" placeholder="Penicillin, Aspirin" {...register("allergiesText")} />
          <Input label="Chronic Conditions (comma separated)" placeholder="Diabetes, Hypertension" {...register("chronicText")} />
          <Input label="Current Medications (comma separated)" placeholder="Metformin 500mg, Amlodipine" {...register("medicationsText")} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} placeholder="Any additional notes..." {...register("notes")} />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={createPatient.isPending}>Register Patient</Button>
        </div>
      </form>
    </div>
  );
}
