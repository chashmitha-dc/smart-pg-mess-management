import axiosInstance from "./axios";

// Get all members
export const getMembers = () => {
  return axiosInstance.get("/member");
};

// Get one member
export const getMember = (id) => {
  return axiosInstance.get(`/member/${id}`);
};

// Create member
export const createMember = (data) => {
  return axiosInstance.post("/member", data);
};

// Update member
export const updateMember = (id, data) => {
  return axiosInstance.put(`/member/${id}`, data);
};

// Delete member
export const deleteMember = (id) => {
  return axiosInstance.delete(`/member/${id}`);
};

// Get member profile (self)
export const getMemberProfile = () => {
  return axiosInstance.get("/member/profile");
};

// Update member profile (self)
export const updateMemberProfile = (data) => {
  return axiosInstance.put("/member/profile", data);
};