import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Clock } from "lucide-react";
import { useCreateAppointment, useAvailableSlots } from "../../hooks/useAppointments";
import { useAuthStore } from "../../store/authStore";
import PatientSearch from "../../components/patient/PatientSearch";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { clsx } from "clsx";
import toast from "react-hot-toast";

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { register, handleSubmit } = useForm();
  const createAppointment = useCreateAppointment();
  const { data: slots } = useAvailableSlots(user?._id, selectedDate);

  const onSubmit = async (data) => {
    if (!selectedPatient) { alert("Please select a patient"); return; }
    if (!selectedSlot) { alert("Please select a time slot"); return; }
    try {
      await createAppointment.mutateAsync({ patientId: selectedPatient._id, doctorId: user._id, date: selectedDate, timeSlot: selectedSlot, reason: data.reason, type: "scheduled" });
      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Patient</h3>
          <PatientSearch onSelect={setSelectedPatient} />
          {selectedPatient && (
            <div className="bg-primary-50 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center"><span className="text-white text-sm font-bold">{selectedPatient.name[0]}</span></div>
              <div><p className="text-sm font-semibold text-gray-900">{selectedPatient.name}</p><p className="text-xs text-gray-500">{selectedPatient.patientId} · {selectedPatient.phone}</p></div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Date & Time</h3>
          <Input label="Date" type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }} min={new Date().toISOString().split("T")[0]} />
          {slots && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button key={slot.start} type="button" disabled={!slot.available} onClick={() => setSelectedSlot(slot)}
                    className={clsx("py-2 px-3 rounded-lg text-xs font-medium border transition-all", slot.available ? selectedSlot?.start === slot.start ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 hover:border-primary-300 text-gray-700" : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50")}>
                    <Clock size={10} className="inline mr-1" />{slot.start}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <Input label="Reason for visit" placeholder="Chief complaint or reason" {...register("reason")} />
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={createAppointment.isPending}>Book Appointment</Button>
        </div>
      </form>
    </div>
  );
}
