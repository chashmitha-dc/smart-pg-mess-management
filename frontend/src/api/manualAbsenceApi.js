import api from "./axios";

// Create a manual absence adjustment for a member
// data: { member_id: number, absent_days: number, reason?: string }
export const createManualAbsenceAdjustment = async (data) => {
  return await api.post("/billing/manual-absence", data);
};
