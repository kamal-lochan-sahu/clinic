import api from "./api";

export const prescriptionService = {
  create: (data) => api.post("/prescriptions", data),
  getById: (id) => api.get("/prescriptions/" + id),
  getByPatient: (patientId) => api.get("/prescriptions/patient/" + patientId),
  getTemplates: () => api.get("/prescriptions/templates"),
  createTemplate: (data) => api.post("/prescriptions/templates", data),
};
