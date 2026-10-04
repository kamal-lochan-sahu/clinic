import api from "./api";

export const staffService = {
  // Doctors of the logged-in user's clinic (owner + staff doctors)
  getDoctors: () => api.get("/staff/doctors"),
};
