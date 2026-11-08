import React from "react";
import { FaTimes, FaBookReader } from "react-icons/fa";

const PdfModal = ({ book, onClose }) => {
  if (!book) return null;

  // Əgər spesifik PDF url yoxdursa nümunə sənəd göstərək
  const pdfSource = book.pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2500,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1e293b",
          borderRadius: "14px",
          width: "90%",
          maxWidth: "1000px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "14px 20px",
            background: "#0f172a",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #334155",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaBookReader size={20} color="#38bdf8" />
            <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
              {book.title} - Rəqəmsal Oxucu
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div style={{ flex: 1, background: "#334155" }}>
          <iframe
            src={`${pdfSource}#toolbar=0`}
            title={book.title}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfModal;
