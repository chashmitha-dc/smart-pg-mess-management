import axiosInstance from "./axios";

export const getMealPlans = () => {
  return axiosInstance.get("/meal-plan/");
};

export const getMealPlan = (id) => {
  return axiosInstance.get(`/meal-plan/${id}`);
};

export const createMealPlan = (data) => {
  return axiosInstance.post("/meal-plan/", data);
};

export const updateMealPlan = (id, data) => {
  return axiosInstance.put(`/meal-plan/${id}`, data);
};

export const deleteMealPlan = (id) => {
  return axiosInstance.delete(`/meal-plan/${id}`);
};