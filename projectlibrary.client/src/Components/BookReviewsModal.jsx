import React, { useState, useEffect } from "react";
import { FaStar, FaTrash, FaTimes, FaUserCircle } from "react-icons/fa";
import { getBookReviews, addReview, deleteReview } from "../Api/featuresApi";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";

const BookReviewsModal = ({ book, onClose, onReviewAdded }) => {
  const { user, role } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (book?.bookId) {
      loadReviews();
    }
  }, [book?.bookId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getBookReviews(book.bookId);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning("Zəhmət olmasa rəyinizi yazın.");
      return;
    }

    setSubmitting(true);
    try {
      await addReview({
        bookId: book.bookId,
        rating,
        comment: comment.trim(),
      });
      toast.success("Rəyiniz əlavə olundu!");
      setComment("");
      await loadReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Rəy əlavə edilərkən xəta baş verdi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Bu rəyi silmək istədiyinizə əminsiniz?")) return;
    try {
      await deleteReview(reviewId);
      toast.info("Rəy silindi.");
      await loadReviews();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      toast.error("Rəy silinə bilmədi.");
    }
  };

  if (!book) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          maxWidth: "550px",
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#1e293b" }}>
              {book.title} - Rəylər
            </h3>
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Orta reytinq: ⭐ {book.ratingAverage || 0} ({reviews.length} rəy)
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "#64748b",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Reviews List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Rəylər yüklənir...</p>
          ) : reviews.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
              Bu kitab üçün hələ rəy yazılmayıb. İlk rəyi siz yazın!
            </p>
          ) : (
            reviews.map((r) => (
              <div
                key={r.reviewId}
                style={{
                  marginBottom: "16px",
                  paddingBottom: "14px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaUserCircle size={22} color="#94a3b8" />
                    <strong style={{ fontSize: "0.9rem", color: "#334155" }}>
                      {r.user?.fullName || "Oxucu"}
                    </strong>
                    <div style={{ display: "flex", color: "#f59e0b", marginLeft: "6px" }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={13}
                          color={i < r.rating ? "#f59e0b" : "#e2e8f0"}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    {(role === "Admin" || user?.id === r.userId) && (
                      <button
                        onClick={() => handleDelete(r.reviewId)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                        title="Sil"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ margin: "6px 0 0 30px", fontSize: "0.85rem", color: "#475569" }}>
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Review Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
            background: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
              Qiymətiniz:
            </span>
            <div style={{ display: "flex", gap: "4px", cursor: "pointer" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={20}
                  color={star <= rating ? "#f59e0b" : "#cbd5e1"}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Fikrinizi bölüşün..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0 18px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Göndərilir..." : "Göndər"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookReviewsModal;
