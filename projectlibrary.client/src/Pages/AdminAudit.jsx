import React, { useState, useEffect } from "react";
import { FaHistory, FaFileExcel, FaDownload, FaShieldAlt } from "react-icons/fa";
import { getRecentAuditLogs, downloadBooksCsv, downloadBorrowsCsv } from "../Api/featuresApi";
import { toast, ToastContainer } from "react-toastify";

const AdminAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getRecentAuditLogs(100);
      setLogs(data);
    } catch {
      toast.error("Loqlar yüklənə bilmədi.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportBooks = async () => {
    setExporting(true);
    try {
      await downloadBooksCsv();
      toast.success("Kitablar CSV faylı endirildi!");
    } catch {
      toast.error("Fayl endirilərkən xəta baş verdi.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportBorrows = async () => {
    setExporting(true);
    try {
      await downloadBorrowsCsv();
      toast.success("İcarələr CSV faylı endirildi!");
    } catch {
      toast.error("Fayl endirilərkən xəta baş verdi.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 20px" }}>
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
          <FaShieldAlt size={28} color="#3b82f6" />
          <div>
            <h2 style={{ margin: 0, color: "var(--text-title)", fontSize: "1.8rem" }}>
              Sistem Əməliyyat Tarixçəsi (Audit Log)
            </h2>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Bütün kritik dəyişikliklər və admin hərəkətləri qeydə alınır.
            </span>
          </div>
        </div>

        {/* Export Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleExportBooks}
            disabled={exporting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#10b981",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: exporting ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            <FaFileExcel /> Kitablar (CSV)
          </button>
          <button
            onClick={handleExportBorrows}
            disabled={exporting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#059669",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: exporting ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            <FaDownload /> İcarələr (CSV)
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>Yüklənir...</div>
      ) : logs.length === 0 ? (
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
          <FaHistory size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
          <h3 style={{ color: "var(--text-title)" }}>Hələ heç bir loq qeydi yoxdur</h3>
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
                <th style={{ padding: "14px 16px" }}>Tarix & Saat</th>
                <th style={{ padding: "14px 16px" }}>İnzibatçı</th>
                <th style={{ padding: "14px 16px" }}>Əməliyyat</th>
                <th style={{ padding: "14px 16px" }}>Obyekt</th>
                <th style={{ padding: "14px 16px" }}>Təfərrüat</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.auditId} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--text-title)" }}>
                    {log.userName || log.userId || "Sistem"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background:
                          log.action === "CREATE"
                            ? "#dcfce7"
                            : log.action === "UPDATE"
                            ? "#fef3c7"
                            : log.action === "DELETE"
                            ? "#fee2e2"
                            : "#e0e7ff",
                        color:
                          log.action === "CREATE"
                            ? "#166534"
                            : log.action === "UPDATE"
                            ? "#b45309"
                            : log.action === "DELETE"
                            ? "#991b1b"
                            : "#4338ca",
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-body)", fontWeight: 500 }}>
                    {log.entityName} {log.entityId ? `(#${log.entityId})` : ""}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "var(--text-body)" }}>
                    {log.details || "-"}
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

export default AdminAudit;
