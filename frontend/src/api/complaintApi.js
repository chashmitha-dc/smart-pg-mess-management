import api from "./axios";

export const getComplaints = async () => {
  return await api.get("/complaint/");
};

export const getComplaintDetails = async (id) => {
  return await api.get(`/complaint/${id}`);
};

export const raiseComplaint = async (data) => {
  return await api.post("/complaint/", data);
};

export const updateComplaintStatus = async (id, data) => {
  return await api.put(`/complaint/${id}`, data);
};

export const deleteComplaint = async (id) => {
  return await api.delete(`/complaint/${id}`);
};
