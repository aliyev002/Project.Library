import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaTrash, FaBookOpen } from "react-icons/fa";
import { getWishlist, toggleWishlist } from "../Api/featuresApi";
import { toast, ToastContainer } from "react-toastify";

const Wishlist = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await getWishlist();
      setBooks(data);
    } catch (err) {
      toast.error("Sevimlilər yüklənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    try {
      await toggleWishlist(bookId);
      setBooks((prev) => prev.filter((b) => b.bookId !== bookId));
      toast.info("Kitab sevimlilərdən çıxarıldı.");
    } catch (err) {
      toast.error("Əməliyyat uğursuz oldu.");
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
      <ToastContainer position="bottom-right" />
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "25px" }}>
        <FaHeart size={28} color="#ef4444" />
        <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.8rem" }}>Sevimlilər Siyahım</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>Yüklənir...</div>
      ) : books.length === 0 ? (
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "14px",
            padding: "50px 20px",
            textAlign: "center",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            border: "1px solid var(--border-color)",
          }}
        >
          <FaBookOpen size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
          <h3 style={{ color: "var(--text-title)", marginBottom: "8px" }}>Sevimlilər siyahınız boşdur</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            Bəyəndiyiniz kitabları ürək düyməsinə klikləyərək buraya əlavə edə bilərsiniz.
          </p>
          <Link
            to="/home"
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "10px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Kitab Kataloquna Get
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {books.map((book) => (
            <div
              key={book.bookId}
              style={{
                background: "var(--bg-card)",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-color)",
                transition: "transform 0.2s",
              }}
            >
              <img
                src={book.imageUrl}
                alt={book.title}
                style={{ width: "100%", height: "260px", objectFit: "cover" }}
              />
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    alignSelf: "flex-start",
                    background: "var(--primary-light, #e0f2fe)",
                    color: "var(--primary, #0369a1)",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  {book.genre}
                </span>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", color: "var(--text-title)" }}>
                  {book.title}
                </h4>
                <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {book.author}
                </p>
                <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                  <Link
                    to="/home"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      background: "var(--bg-main)",
                      color: "var(--text-title)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    Bax
                  </Link>
                  <button
                    onClick={() => handleRemove(book.bookId)}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      color: "#ef4444",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Sil"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
