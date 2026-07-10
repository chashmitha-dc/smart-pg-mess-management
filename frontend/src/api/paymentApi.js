import api from "./axios";

export const getPayments = async () => {
  return await api.get("/payment/");
};

export const getPaymentDetails = async (id) => {
  return await api.get(`/payment/${id}`);
};

export const createPayment = async (data) => {
  return await api.post("/payment/", data);
};

export const updatePayment = async (id, data) => {
  return await api.put(`/payment/${id}`, data);
};

export const deletePayment = async (id) => {
  return await api.delete(`/payment/${id}`);
};
