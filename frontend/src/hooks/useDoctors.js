import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { staffService } from "../services/staff.service";

// Loads the clinic's doctors and keeps a selected doctorId.
// Defaults to the logged-in user when they are a doctor/owner, otherwise to the first doctor.
export const useDoctors = () => {
  const { user } = useAuthStore();
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => staffService.getDoctors().then((r) => r.data.data),
    enabled: !!user,
  });
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    if (doctorId || doctors.length === 0) return;
    const mine = doctors.find((d) => d._id === user?._id);
    setDoctorId((mine || doctors[0])._id);
  }, [doctors, doctorId, user?._id]);

  return { doctors, doctorId, setDoctorId, isLoading };
};
