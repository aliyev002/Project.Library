import React, { useState, useEffect } from "react";
import { FaLightbulb, FaGift, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import { getMySuggestions, getAllSuggestions, createSuggestion, updateSuggestionStatus } from "../Api/featuresApi";
import { useAuth } from "../Context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

const BookSuggestions = () => {
  const { role } = useAuth();
  const isAdmin = role === "Admin";
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    type: "Suggestion",
    note: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await getAllSuggestions() : await getMySuggestions();
      setSuggestions(data);
    } catch {
      toast.error("Müraciətlər yüklənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      toast.warning("Kitabın və müəllifin adı tələb olunur.");
      return;
    }

    try {
      await createSuggestion(formData);
      toast.success("Müraciətiniz uğurla göndərildi!");
      setShowModal(false);
      setFormData({ title: "", author: "", genre: "", type: "Suggestion", note: "" });
      await loadData();
    } catch {
      toast.error("Müraciət göndərilərkən xəta baş verdi.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateSuggestionStatus(id, status);
      toast.info(`Status "${status}" olaraq yeniləndi.`);
      await loadData();
    } catch {
      toast.error("Status yenilənə bilmədi.");
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px" }}>
      <ToastContainer position="bottom-right" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <FaLightbulb size={28} color="#f59e0b" />
          <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.8rem" }}>
            {isAdmin ? "Kitab Təklifləri və İanələr (İnzibatçı)" : "Kitab Təklif Et və ya İanə Et"}
          </h2>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <FaPlus /> Yeni Müraciət
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>Yüklənir...</div>
      ) : suggestions.length === 0 ? (
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
          <FaGift size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
          <h3 style={{ color: "var(--text-title)" }}>Hələ heç bir müraciət yoxdur</h3>
          <p style={{ color: "var(--text-muted)" }}>
            Kitabxanada görmək istədiyiniz kitabları təklif edə və ya öz kitablarınızı ianə edə bilərsiniz.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid var(--border-color)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-color)", color: "var(--text-title)" }}>
                {isAdmin && <th style={{ padding: "14px 16px" }}>İstifadəçi</th>}
                <th style={{ padding: "14px 16px" }}>Kitabın Adı</th>
                <th style={{ padding: "14px 16px" }}>Müəllif</th>
                <th style={{ padding: "14px 16px" }}>Növ</th>
                <th style={{ padding: "14px 16px" }}>Qeyd</th>
                <th style={{ padding: "14px 16px" }}>Status</th>
                {isAdmin && <th style={{ padding: "14px 16px" }}>Əməliyyat</th>}
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.suggestionId} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {isAdmin && (
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--text-title)" }}>
                      {s.user?.fullName || s.userId}
                    </td>
                  )}
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--text-title)" }}>{s.title}</td>
                  <td style={{ padding: "14px 16px", color: "var(--text-body)" }}>{s.author}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: s.type === "Donation" ? "#fef3c7" : "#e0e7ff",
                        color: s.type === "Donation" ? "#b45309" : "#4338ca",
                      }}
                    >
                      {s.type === "Donation" ? "İanə (Hədiyyə)" : "Təklif"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {s.note || "-"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background:
                          s.status === "Approved"
                            ? "#dcfce7"
                            : s.status === "Rejected"
                            ? "#fee2e2"
                            : "#fef9c3",
                        color:
                          s.status === "Approved"
                            ? "#166534"
                            : s.status === "Rejected"
                            ? "#991b1b"
                            : "#854d0e",
                      }}
                    >
                      {s.status === "Approved"
                        ? "Təsdiqləndi"
                        : s.status === "Rejected"
                        ? "İmtina edildi"
                        : "Gözləmədə"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: "14px 16px" }}>
                      {s.status === "Pending" && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleStatusChange(s.suggestionId, "Approved")}
                            style={{
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                            title="Təsdiq et"
                          >
                            <FaCheck size={12} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(s.suggestionId, "Rejected")}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                            title="İmtina et"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "16px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              maxWidth: "480px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", color: "#1e293b" }}>Yeni Kitab Təklifi və ya İanəsi</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Müraciət Növü
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  <option value="Suggestion">Kitab Təklifi (Kitabxanada olmasını istəyirəm)</option>
                  <option value="Donation">Kitab İanəsi (Kitabxanaya hədiyyə etmək istəyirəm)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Kitabın Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Müəllif *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Janr
                </label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Əlavə Qeyd
                </label>
                <textarea
                  rows="3"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Nə üçün bu kitab tövsiyə edilir və ya kitabın vəziyyəti haqqında..."
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#3b82f6",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Göndər
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSuggestions;
