import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../services/appointment.service";
import toast from "react-hot-toast";

export const useAppointments = (params) => {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentService.getAll(params).then((r) => r.data.data),
  });
};

export const useCalendarAppointments = (params) => {
  return useQuery({
    queryKey: ["appointments-calendar", params],
    queryFn: () => appointmentService.getCalendar(params).then((r) => r.data.data),
  });
};

export const useAvailableSlots = (doctorId, date) => {
  return useQuery({
    queryKey: ["slots", doctorId, date],
    queryFn: () => appointmentService.getSlots(doctorId, date).then((r) => r.data.data),
    enabled: !!(doctorId && date),
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment booked!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to book appointment"),
  });
};
