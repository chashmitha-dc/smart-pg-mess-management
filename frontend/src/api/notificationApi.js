import api from "./axios";

export const getNotifications = async () => {
  return await api.get("/notification/");
};

export const getNotificationDetails = async (id) => {
  return await api.get(`/notification/${id}`);
};

export const sendNotification = async (data) => {
  return await api.post("/notification/", data);
};

export const updateNotification = async (id, data) => {
  return await api.put(`/notification/${id}`, data);
};

export const deleteNotification = async (id) => {
  return await api.delete(`/notification/${id}`);
};
