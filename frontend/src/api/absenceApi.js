import api from "./axios";

export const getAbsences = async () => {
  return await api.get("/absence/");
};

export const applyLeave = async (data) => {
  return await api.post("/absence/", data);
};

export const approveLeave = async (id) => {
  return await api.put(`/absence/${id}/approve`);
};

export const rejectLeave = async (id) => {
  return await api.put(`/absence/${id}/reject`);
};
