import api from "./api";

export const consultationService = {
  getAll: (params) => api.get("/consultations", { params }),
  getById: (id) => api.get("/consultations/" + id),
  create: (data) => api.post("/consultations", data),
  update: (id, data) => api.put("/consultations/" + id, data),
};
