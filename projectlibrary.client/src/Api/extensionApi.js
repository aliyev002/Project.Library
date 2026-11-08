import api from "./client";

export const requestExtension = async (borrowId) => {
  const response = await api.post(`/extension/request/${borrowId}`);
  return response.data;
};

export const getUserExtensions = async (userId) => {
  const response = await api.get(`/extension/user/${userId}`);
  return response.data;
};

export const getAllExtensions = async () => {
  const response = await api.get("/extension/all");
  return response.data;
};

export const approveExtension = async (id) => {
  const response = await api.post(`/extension/approve/${id}`);
  return response.data;
};

export const declineExtension = async (id) => {
  const response = await api.post(`/extension/decline/${id}`);
  return response.data;
};
