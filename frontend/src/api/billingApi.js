import api from "./axios";

export const getBills = async () => {
  return await api.get("/billing/");
};

export const getBillDetails = async (id) => {
  return await api.get(`/billing/${id}`);
};

export const generateMemberBill = async (memberId) => {
  return await api.post(`/billing/generate/${memberId}`);
};

export const generateAllBills = async () => {
  return await api.post("/billing/generate-all");
};
