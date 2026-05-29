import api from "./api";

export const patientService = {
  getAll: (params) => api.get("/patients", { params }),
  search: (q) => api.get("/patients/search", { params: { q } }),
  getById: (id) => api.get("/patients/" + id),
  create: (data) => api.post("/patients", data),
  update: (id, data) => api.put("/patients/" + id, data),
  getHistory: (id) => api.get("/patients/" + id + "/history"),
};
