import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaCheckCircle, FaCalculator } from "react-icons/fa";
import { getMyPenalties, getAllPenalties, payPenalty, calculateOverdue } from "../Api/featuresApi";
import { useAuth } from "../Context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

const Penalties = () => {
  const { role } = useAuth();
  const isAdmin = role === "Admin";
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPenalties();
  }, []);

  const loadPenalties = async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await getAllPenalties() : await getMyPenalties();
      setPenalties(data);
    } catch {
      toast.error("Cərimələr yüklənə bilmədi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (penaltyId) => {
    try {
      await payPenalty(penaltyId);
      toast.success("Cərimə uğurla ödənildi!");
      await loadPenalties();
    } catch {
      toast.error("Ödəniş uğursuz oldu.");
    }
  };

  const handleCalculateAll = async () => {
    setActionLoading(true);
    try {
      await calculateOverdue();
      toast.success("Gecikmiş icarələr üzrə cərimələr yeniləndi!");
      await loadPenalties();
    } catch {
      toast.error("Hesablama xətası.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalUnpaid = penalties
    .filter((p) => !p.isPaid)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

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
          <FaMoneyBillWave size={28} color="#10b981" />
          <div>
            <h2 style={{ margin: 0, color: "var(--text-title)", fontSize: "1.8rem" }}>
              {isAdmin ? "Cərimə və Gecikmə Nəzarəti" : "Cərimələrim və Gecikmə Haqqı"}
            </h2>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              {isAdmin ? "Ümumi ödənilməmiş borc məbləği: " : "Ödənilməmiş borc cəmi: "}
              <strong style={{ color: "var(--text-title)" }}>{totalUnpaid.toFixed(2)} AZN</strong>
            </span>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleCalculateAll}
            disabled={actionLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: actionLoading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            <FaCalculator /> Gecikmələri Yenidən Hesabla
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>Yüklənir...</div>
      ) : penalties.length === 0 ? (
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
          <FaCheckCircle size={48} color="#10b981" style={{ marginBottom: "16px" }} />
          <h3 style={{ color: "var(--text-title)", marginBottom: "8px" }}>
            {isAdmin ? "Hazırda heç bir cərimə qeydi yoxdur" : "Heç bir cəriməniz yoxdur!"}
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            {isAdmin
              ? "Kitabxanada aktiv gecikmiş borc və ya cərimə tətbiq olunmuş oxucu mövcud deyil."
              : "Bütün kitabları vaxtında qaytardığınız üçün təşəkkür edirik."}
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
                <th style={{ padding: "14px 16px" }}>Kitab</th>
                <th style={{ padding: "14px 16px" }}>Səbəb</th>
                <th style={{ padding: "14px 16px" }}>Məbləğ</th>
                <th style={{ padding: "14px 16px" }}>Tarix</th>
                <th style={{ padding: "14px 16px" }}>Status</th>
                <th style={{ padding: "14px 16px" }}>Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((p) => (
                <tr key={p.penaltyId} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {isAdmin && (
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--text-title)" }}>
                      {p.user?.fullName || p.userId}
                    </td>
                  )}
                  <td style={{ padding: "14px 16px", color: "var(--text-title)" }}>
                    {p.borrowedBook?.book?.title || "İcarə qeydi"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-body)" }}>{p.reason}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: p.isPaid ? "#10b981" : "#ef4444" }}>
                    {p.amount.toFixed(2)} AZN
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: p.isPaid ? "#dcfce7" : "#fee2e2",
                        color: p.isPaid ? "#166534" : "#991b1b",
                      }}
                    >
                      {p.isPaid ? "Ödənilib" : "Gözləmədə"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {!p.isPaid ? (
                      <button
                        onClick={() => handlePay(p.penaltyId)}
                        style={{
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {isAdmin ? "Ödənildi et" : "Ödə"}
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 600 }}>Tamamlandı</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Penalties;
