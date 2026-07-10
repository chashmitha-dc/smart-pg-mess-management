import api from "./axios";

export const getPGDetails = async () => {
  return await api.get("/pg/");
};

export const createPGDetails = async (data) => {
  return await api.post("/pg/", data);
};

export const updatePGDetails = async (data) => {
  return await api.put("/pg/", data);
};
