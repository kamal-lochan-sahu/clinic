import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../services/patient.service";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

// Debounce hook
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export const usePatients = (params) => {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => patientService.getAll(params).then((r) => r.data.data),
  });
};

export const usePatient = (id) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => patientService.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Patient registered!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to register patient"),
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => patientService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      toast.success("Patient updated!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update patient"),
  });
};
