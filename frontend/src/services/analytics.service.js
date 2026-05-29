import api from "./api";

export const analyticsService = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getRevenue: (period) => api.get("/analytics/revenue", { params: { period } }),
  getPatients: () => api.get("/analytics/patients"),
  getDiagnoses: () => api.get("/analytics/diagnoses"),
};
