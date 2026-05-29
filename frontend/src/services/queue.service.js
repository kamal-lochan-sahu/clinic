import api from "./api";

export const queueService = {
  getTodayQueue: (doctorId) => api.get("/queue/today", { params: { doctorId } }),
  addToQueue: (data) => api.post("/queue/add", data),
  callNext: (data) => api.put("/queue/call-next", data),
  updateTokenStatus: (tokenId, status) => api.put("/queue/token/" + tokenId + "/status", { status }),
};
