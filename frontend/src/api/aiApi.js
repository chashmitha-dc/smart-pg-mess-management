import api from "./axios";

export const getPredictionHistory = async () => {
  return await api.get("/ai/history");
};

export const trainModel = async () => {
  return await api.post("/ai/train");
};

export const getTomorrowPrediction = async () => {
  return await api.post("/ai/predict");
};
