import api from "./client";

// --- REVIEWS & RATINGS ---
export const getBookReviews = async (bookId) => {
  const res = await api.get(`/reviews/book/${bookId}`);
  return res.data?.data || [];
};

export const addReview = async (reviewData) => {
  const res = await api.post("/reviews", reviewData);
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
};

// --- WISHLIST / FAVORITES ---
export const getWishlist = async () => {
  const res = await api.get("/wishlist");
  return res.data?.data || [];
};

export const toggleWishlist = async (bookId) => {
  const res = await api.post(`/wishlist/toggle/${bookId}`);
  return res.data;
};

export const checkWishlist = async (bookId) => {
  const res = await api.get(`/wishlist/check/${bookId}`);
  return res.data?.data?.isInWishlist || false;
};

// --- PENALTIES & FINES ---
export const getMyPenalties = async () => {
  const res = await api.get("/penalties/my");
  return res.data?.data || [];
};

export const getAllPenalties = async () => {
  const res = await api.get("/penalties/all");
  return res.data?.data || [];
};

export const payPenalty = async (penaltyId) => {
  const res = await api.post(`/penalties/pay/${penaltyId}`);
  return res.data;
};

export const calculateOverdue = async () => {
  const res = await api.post("/penalties/calculate-overdue");
  return res.data;
};

// --- BOOK SUGGESTIONS & DONATIONS ---
export const getMySuggestions = async () => {
  const res = await api.get("/suggestions/my");
  return res.data?.data || [];
};

export const getAllSuggestions = async () => {
  const res = await api.get("/suggestions/all");
  return res.data?.data || [];
};

export const createSuggestion = async (data) => {
  const res = await api.post("/suggestions", data);
  return res.data;
};

export const updateSuggestionStatus = async (id, status) => {
  const res = await api.patch(`/suggestions/${id}/status`, JSON.stringify(status), {
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
};

// --- ROOM / DESK BOOKING ---
export const getMyRoomBookings = async () => {
  const res = await api.get("/room-bookings/my");
  return res.data?.data || [];
};

export const getAllRoomBookings = async () => {
  const res = await api.get("/room-bookings/all");
  return res.data?.data || [];
};

export const getRoomBookingsByDate = async (date) => {
  const res = await api.get(`/room-bookings/by-date?date=${encodeURIComponent(date)}`);
  return res.data?.data || [];
};

export const createRoomBooking = async (data) => {
  const res = await api.post("/room-bookings", data);
  return res.data;
};

export const cancelRoomBooking = async (id) => {
  const res = await api.delete(`/room-bookings/${id}`);
  return res.data;
};

// --- NOTIFICATIONS ---
export const getMyNotifications = async () => {
  const res = await api.get("/notifications/my");
  return res.data?.data || [];
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/notifications/read/${id}`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.post("/notifications/read-all");
  return res.data;
};

// --- PROFILE & SETTINGS ---
export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data?.data;
};

export const updateMyProfile = async (data) => {
  const res = await api.put("/profile/update", data);
  return res.data;
};

// --- AUDIT LOGS ---
export const getRecentAuditLogs = async (count = 50) => {
  const res = await api.get(`/audit/recent?count=${count}`);
  return res.data?.data || [];
};

// --- EXPORT WITH AUTH TOKEN ---
export const downloadBooksCsv = async () => {
  const response = await api.get("/export/books-csv", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Kitablar_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadBorrowsCsv = async () => {
  const response = await api.get("/export/borrows-csv", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Icareler_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportBooksCsvUrl = () => `${api.defaults.baseURL}/export/books-csv`;
export const exportBorrowsCsvUrl = () => `${api.defaults.baseURL}/export/borrows-csv`;

// --- FILE UPLOAD ---
export const uploadImageFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  // Content-Type manual verilməməlidir ki, browser boundary avtomatik əlavə etsin
  const res = await api.post("/upload/image", formData, {
    headers: { "Content-Type": undefined }
  });
  return res.data?.data;
};
