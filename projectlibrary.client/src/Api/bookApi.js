import api from "./client";

export const getAllBooks = async () => {
  const response = await api.get("/books/all");
  return response.data;
};

export const getBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

export const getAvailableBooks = async () => {
  const response = await api.get("/books/available");
  return response.data;
};

export const searchBooks = async (query) => {
  const response = await api.get("/books/search", { params: { query } });
  return response.data;
};

export const getGenres = async () => {
  const response = await api.get("/books/genres");
  return response.data;
};

export const getBooksByGenre = async (genre) => {
  const response = await api.get("/books/bygenre", { params: { genre } });
  return response.data;
};

export const addBook = async (bookData) => {
  const response = await api.post("/books/add", bookData);
  return response.data;
};

export const editBook = async (id, bookData) => {
  const response = await api.put(`/books/edit/${id}`, bookData);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/books/delete/${id}`);
  return response.data;
};
