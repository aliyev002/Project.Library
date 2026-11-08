import api from "./client";

export const borrowBook = async (bookId) => {
  const response = await api.post(`/borrow/borrow/${bookId}`);
  return response.data;
};

export const returnBook = async (borrowId) => {
  const response = await api.post(`/borrow/return/${borrowId}`);
  return response.data;
};

export const getUserAllBorrows = async (userId) => {
  const response = await api.get(`/borrow/user/${userId}/all`);
  return response.data;
};

export const getUserActiveBorrows = async (userId) => {
  const response = await api.get(`/borrow/user/${userId}/active`);
  return response.data;
};

export const getAllBorrowedBooks = async () => {
  const response = await api.get("/borrow/getallborrowedbooks");
  return response.data;
};
