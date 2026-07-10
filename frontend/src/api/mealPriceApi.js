import api from "./axios";

export const getMealPrice = async () => {
  return await api.get("/meal-price/");
};

export const createMealPrice = async (data) => {
  return await api.post("/meal-price/", data);
};

export const updateMealPrice = async (data) => {
  return await api.put("/meal-price/", data);
};
