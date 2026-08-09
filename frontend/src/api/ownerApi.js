import api from "./axios";

export const getOwnerProfile = async () => {
  return await api.get("/owner/profile");
};

export const updateOwnerProfile = async (data) => {
  return await api.put("/owner/profile", data);
};

export const getBillingIncrementSettings = async () => {
  return await api.get("/owner/billing-increment");
};

export const updateBillingIncrementSettings = async (data) => {
  return await api.post("/owner/billing-increment", data);
};
