import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import api from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import toast from "react-hot-toast";

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ["settings"], queryFn: () => api.get("/settings").then(r => r.data.data) });
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { if (settings) reset({ "clinic.name": settings.clinic?.name, "clinic.phone": settings.clinic?.phone, "clinic.email": settings.clinic?.email, "clinic.address": settings.clinic?.address, "branding.doctorName": settings.branding?.doctorName, "branding.specialization": settings.branding?.specialization, "branding.primaryColor": settings.branding?.primaryColor, "billing.consultationFee": settings.billing?.consultationFee }); }, [settings, reset]);

  const updateSettings = useMutation({ mutationFn: (data) => api.put("/settings", data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Settings saved!"); } });

  if (isLoading) return <Loader text="Loading settings..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      <form onSubmit={handleSubmit(data => updateSettings.mutate(data))} className="space-y-5">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Clinic Information</h3>
          <Input label="Clinic Name" {...register("clinic.name")} />
          <Input label="Doctor Name" {...register("branding.doctorName")} />
          <Input label="Specialization" {...register("branding.specialization")} />
          <Input label="Phone" {...register("clinic.phone")} />
          <Input label="Email" type="email" {...register("clinic.email")} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} {...register("clinic.address")} />
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Branding</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <input type="color" className="h-10 w-20 rounded cursor-pointer border border-gray-200" {...register("branding.primaryColor")} />
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Billing</h3>
          <Input label="Default Consultation Fee (Rs.)" type="number" {...register("billing.consultationFee")} />
        </Card>
        <Button type="submit" loading={updateSettings.isPending}>Save Settings</Button>
      </form>
    </div>
  );
}
