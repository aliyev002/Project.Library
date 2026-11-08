import api from "./client";

export const getAdminSummary = async () => {
  const response = await api.get("/stats/summary");
  return response.data;
};

export const getUserSummary = async (userId) => {
  const response = await api.get(`/stats/user/${userId}`);
  return response.data;
};
