import api from "./axios";

export const getBackupFile = async () => {
  return await api.get("/backup/download", { responseType: "blob" });
};

export const uploadRestoreFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await api.post("/backup/restore", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
