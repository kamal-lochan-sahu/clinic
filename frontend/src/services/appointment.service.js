import api from "./api";

export const appointmentService = {
  getAll: (params) => api.get("/appointments", { params }),
  getCalendar: (params) => api.get("/appointments/calendar", { params }),
  getSlots: (doctorId, date) => api.get("/appointments/slots", { params: { doctorId, date } }),
  getById: (id) => api.get("/appointments/" + id),
  create: (data) => api.post("/appointments", data),
  updateStatus: (id, data) => api.put("/appointments/" + id + "/status", data),
};
