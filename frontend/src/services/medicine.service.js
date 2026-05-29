import api from "./api";

export const medicineService = {
  getAll: (params) => api.get("/medicines", { params }),
  getById: (id) => api.get("/medicines/" + id),
  create: (data) => api.post("/medicines", data),
  update: (id, data) => api.put("/medicines/" + id, data),
  delete: (id) => api.delete("/medicines/" + id),
  getLowStock: () => api.get("/medicines/low-stock"),
  getExpiring: () => api.get("/medicines/expiring"),
  updateStock: (id, data) => api.put("/medicines/" + id + "/stock", data),
};
