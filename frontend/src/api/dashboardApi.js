import axiosInstance from "./axios";

export const getDashboard = () => {
  return axiosInstance.get("/dashboard");
};