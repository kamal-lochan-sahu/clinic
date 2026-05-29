import api from "./api";

export const paymentService = {
  getAll: (params) => api.get("/payments", { params }),
  getById: (id) => api.get("/payments/" + id),
  create: (data) => api.post("/payments", data),
  getDaySummary: (date) => api.get("/payments/day-summary", { params: { date } }),
};
