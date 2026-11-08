import api from "./client";

export const reserveBook = async (bookId) => {
  const response = await api.post(`/reserve/reserve/${bookId}`);
  return response.data;
};

export const cancelReservation = async (id) => {
  const response = await api.post(`/reserve/cancel/${id}`);
  return response.data;
};

export const getUserReservations = async (userId) => {
  const response = await api.get(`/reserve/user/${userId}`);
  return response.data;
};

export const getAllReservations = async () => {
  const response = await api.get("/reserve/all");
  return response.data;
};

export const approveReservation = async (id) => {
  const response = await api.post(`/reserve/approve/${id}`);
  return response.data;
};

export const declineReservation = async (id) => {
  const response = await api.post(`/reserve/decline/${id}`);
  return response.data;
};
