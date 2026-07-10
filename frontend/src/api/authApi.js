import api from "./axios";

/*
|--------------------------------------------------------------------------
| Authentication APIs
|--------------------------------------------------------------------------
*/

export const loginOwner = async (credentials) => {
  return await api.post("/auth/login", credentials);
};

export const loginMember = async (credentials) => {
  return await api.post("/auth/member/login", credentials);
};

export const registerOwner = async (ownerData) => {
  return await api.post("/auth/register", ownerData);
};

export const getOwnerProfile = async () => {
  return await api.get("/owner/profile");
};

export const updateOwnerProfile = async (ownerData) => {
  return await api.put("/owner/profile", ownerData);
};

export const forgotPassword = async (data) => {
  return await api.post("/auth/forgot-password", data);
};

export const resetPassword = async (data) => {
  return await api.post("/auth/reset-password", data);
};

export const changePassword = async (data) => {
  return await api.post("/auth/change-password", data);
};