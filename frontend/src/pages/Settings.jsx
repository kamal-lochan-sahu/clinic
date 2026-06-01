import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import api from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function Settings() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings").then(r => r.data.data),
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settings) {
      reset({
        clinic: {
          name: settings.clinic?.name,
          phone: settings.clinic?.phone,
          email: settings.clinic?.email,
          address: settings.clinic?.address,
          website: settings.clinic?.website,
        },
        branding: {
          doctorName: settings.branding?.doctorName,
          specialization: settings.branding?.specialization,
          primaryColor: settings.branding?.primaryColor || "#0ea5e9",
          registrationNumber: settings.branding?.registrationNumber,
        },
        appointments: {
          slotDuration: settings.appointments?.slotDuration || 15,
          advanceBookingDays: settings.appointments?.advanceBookingDays || 30,
          autoConfirm: settings.appointments?.autoConfirm || false,
        },
        notifications: {
          appointmentReminder: settings.notifications?.appointmentReminder ?? true,
          followUpReminder: settings.notifications?.followUpReminder ?? true,
          reportReady: settings.notifications?.reportReady ?? true,
          reminderHoursBefore: settings.notifications?.reminderHoursBefore || 24,
        },
        billing: {
          consultationFee: settings.billing?.consultationFee || 500,
          currency: settings.billing?.currency || "INR",
        },
      });
    }
  }, [settings, reset]);

  const updateSettings = useMutation({
    mutationFn: (data) => api.put("/settings", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Update user branding in auth store
      if (user && res.data.data) {
        setUser({
          ...user,
          branding: {
            ...user.branding,
            clinicName: res.data.data.clinic?.name,
            primaryColor: res.data.data.branding?.primaryColor,
            doctorName: res.data.data.branding?.doctorName,
          }
        });
      }
      toast.success("Settings saved!");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  if (isLoading) return <Loader text="Loading settings..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>

      <form onSubmit={handleSubmit(data => updateSettings.mutate(data))} className="space-y-5">

        {/* Clinic Information */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-700">Clinic Information</h3></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Clinic Name" placeholder="City Health Clinic" {...register("clinic.name")} />
              <Input label="Phone" placeholder="9876543210" {...register("clinic.phone")} />
              <Input label="Email" type="email" placeholder="clinic@email.com" {...register("clinic.email")} />
              <Input label="Website" placeholder="www.yourclinic.com" {...register("clinic.website")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} {...register("clinic.address")} />
            </div>
          </CardBody>
        </Card>

        {/* Doctor & Branding */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-700">Doctor & Branding</h3></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Doctor Name" placeholder="Dr. Ramesh Kumar" {...register("branding.doctorName")} />
              <Input label="Specialization" placeholder="General Physician" {...register("branding.specialization")} />
              <Input label="Registration Number" placeholder="MCI-12345" {...register("branding.registrationNumber")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
              <div className="flex items-center gap-3">
                <input type="color" className="h-10 w-16 rounded cursor-pointer border border-gray-200 p-1"
                  {...register("branding.primaryColor")} />
                <p className="text-xs text-gray-500">This color will be applied throughout the application</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Appointment Settings */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-700">Appointment Settings</h3></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register("appointments.slotDuration")}>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
              <Input label="Advance Booking Days" type="number" min="1" max="90" {...register("appointments.advanceBookingDays")} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="autoConfirm" className="w-4 h-4 text-primary-500 rounded" {...register("appointments.autoConfirm")} />
              <label htmlFor="autoConfirm" className="text-sm font-medium text-gray-700">
                Auto-confirm appointments (skip manual confirmation step)
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-700">Notification Settings</h3></CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              {[
                { key: "notifications.appointmentReminder", label: "Send appointment reminder (D-1)" },
                { key: "notifications.followUpReminder", label: "Send follow-up reminders" },
                { key: "notifications.reportReady", label: "Notify patient when lab report is ready" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <input type="checkbox" id={key} className="w-4 h-4 text-primary-500 rounded" {...register(key)} />
                  <label htmlFor={key} className="text-sm text-gray-700">{label}</label>
                </div>
              ))}
            </div>
            <Input label="Send reminder (hours before appointment)" type="number" min="1" max="48"
              {...register("notifications.reminderHoursBefore")} />
          </CardBody>
        </Card>

        {/* Billing Settings */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-700">Billing Settings</h3></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Default Consultation Fee (Rs.)" type="number" min="0" {...register("billing.consultationFee")} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register("billing.currency")}>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <Button type="submit" loading={updateSettings.isPending} className="w-full justify-center">
          Save All Settings
        </Button>
      </form>
    </div>
  );
}
