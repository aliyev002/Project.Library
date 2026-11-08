import React, { useState, useEffect } from "react";
import { 
  FaChair, 
  FaCalendarCheck, 
  FaClock, 
  FaCalendarAlt,
  FaCheck, 
  FaBolt, 
  FaWifi, 
  FaDesktop, 
  FaVolumeMute, 
  FaSun, 
  FaTrashAlt, 
  FaQrcode,
  FaShieldAlt,
  FaInfoCircle,
  FaBookOpen,
  FaMousePointer,
  FaSearchPlus,
  FaCube,
  FaLightbulb
} from "react-icons/fa";
import { 
  getMyRoomBookings, 
  getAllRoomBookings, 
  getRoomBookingsByDate, 
  createRoomBooking, 
  cancelRoomBooking 
} from "../Api/featuresApi";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";
import Library3DHall, { LIBRARY_ZONES } from "../Components/Library3DHall";

const TIME_SLOTS = [
  { id: "morning", label: "09:00 - 12:00", start: "09:00", end: "12:00", desc: "Səhər Tədqiqat Sessiyası" },
  { id: "midday", label: "12:30 - 15:30", start: "12:30", end: "15:30", desc: "Günorta Dərs Sessiyası" },
  { id: "afternoon", label: "16:00 - 19:00", start: "16:00", end: "19:00", desc: "Axşamüstü İntensiv Oxu" },
  { id: "night", label: "19:30 - 22:30", start: "19:30", end: "22:30", desc: "Gecə Tələbə Sessiyası" },
];

const DEFAULT_SEAT = {
  id: "B-01",
  name: "Mərkəzi Zalı • Masa B-01",
  zone: "Mərkəzi Səssiz Oxu Zalı",
  amenities: [
    "Mütləq Səssizlik Rejimi", 
    "Klassik Banker Masa Lampası", 
    "Fərdi Elektrik Rozetkası", 
    "Taxta Kitab Altlığı"
  ],
  image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80"
};

const RoomBooking = () => {
  const { user, role } = useAuth();
  const isAdmin = role === "Admin";

  const [selectedSeat, setSelectedSeat] = useState(DEFAULT_SEAT);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDateBookings(selectedDate);
    loadMyBookings();
  }, [selectedDate]);

  const loadDateBookings = async (date) => {
    setLoading(true);
    try {
      const data = await getRoomBookingsByDate(date);
      setConfirmedBookings(Array.isArray(data) ? data : []);
    } catch {
      // səssiz
    } finally {
      setLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      const data = isAdmin ? await getAllRoomBookings() : await getMyRoomBookings();
      setMyBookings(Array.isArray(data) ? data : []);
    } catch {
      // səssiz
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSeat) {
      toast.warning("Zəhmət olmasa 3D kitabxana zalından bir masa seçin.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        roomOrSeatNumber: `${selectedSeat.id} - ${selectedSeat.name} (${selectedSeat.zone})`,
        bookingDate: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      };

      await createRoomBooking(payload);
      toast.success(`${selectedSeat.id} (${selectedSeat.zone}) masası uğurla rezerv edildi!`);
      await loadDateBookings(selectedDate);
      await loadMyBookings();
    } catch (err) {
      console.error(err);
      toast.error("Rezervasiya uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bu masa rezervasiyasını ləğv etmək istədiyinizə əminsiniz?")) return;
    try {
      await cancelRoomBooking(bookingId);
      toast.info("Rezervasiya ləğv edildi.");
      await loadDateBookings(selectedDate);
      await loadMyBookings();
    } catch {
      toast.error("Ləğv əməliyyatı yerinə yetirilmədi.");
    }
  };

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "10px 24px 60px 24px" }}>
      
      {/* Top Banner & Control Toolbar */}
      <div style={{
        background: "linear-gradient(135deg, #1E232E 0%, #301724 50%, #581C30 100%)",
        borderRadius: "24px",
        padding: "32px 36px",
        color: "#FFFFFF",
        boxShadow: "0 20px 45px -10px rgba(30, 23, 42, 0.35)",
        marginBottom: "28px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(10px)",
              padding: "6px 14px",
              borderRadius: "30px",
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#F6C177",
              marginBottom: "12px"
            }}>
              <FaBookOpen /> 3D Virtual Oxu Zalı & Rezervasiya Portalı
            </div>
            <h1 style={{ fontSize: "2.3rem", fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
              Kitabxana Masalarının 3D Rezervasiyası
            </h1>
            <p style={{ margin: 0, fontSize: "0.96rem", color: "#E2E8F0", maxWidth: "720px", lineHeight: 1.55 }}>
              Klassik kitab rəfləri, fərdi banker oxu lampaları, kompüter iş stansiyaları və pəncərə önü iş masaları ilə təchiz olunmuş 3D oxu zalından yerinizi seçin.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              padding: "10px 18px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10B981", display: "block" }}>26 Masa</span>
              <span style={{ fontSize: "0.74rem", color: "#CBD5E1", textTransform: "uppercase", fontWeight: 600 }}>4 Fərqli Zona</span>
            </div>
            <div style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              padding: "10px 18px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#E69A38", display: "block" }}>{myBookings.filter(b => b.status === "Confirmed").length}</span>
              <span style={{ fontSize: "0.74rem", color: "#CBD5E1", textTransform: "uppercase", fontWeight: 600 }}>Aktiv Bronum</span>
            </div>
          </div>
        </div>

        {/* Date & Time Slot Selector Toolbar */}
        <div style={{
          marginTop: "22px",
          paddingTop: "18px",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1" }}>Tarix:</span>
              <input 
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  background: "rgba(255, 255, 255, 0.14)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "0.82rem",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      background: isSelected ? "#E69A38" : "rgba(255, 255, 255, 0.08)",
                      color: isSelected ? "#0F172A" : "#FFFFFF",
                      transition: "all 0.2s"
                    }}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: "0.82rem", color: "#CBD5E1", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaInfoCircle color="#F6C177" /> 3D zalı siçanla fırladın və istədiyiniz masanın üstünə klikləyin
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Virtual Library Hall & Ticket Booking Drawer */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: "28px",
        alignItems: "start"
      }}>
        
        {/* LEFT: 3D Virtual Library Scene */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Library3DHall
            selectedSeat={selectedSeat}
            onSelectSeat={(seat) => setSelectedSeat(seat)}
            confirmedBookings={confirmedBookings}
            myBookings={myBookings}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
          />

          <div style={{
            background: "var(--bg-card)",
            padding: "16px 20px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "0.84rem",
            color: "var(--text-muted)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <FaMousePointer color="var(--primary)" /> <strong>İdarəetmə:</strong> Sol düymə ilə 360° fırladın
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <FaSearchPlus color="var(--primary)" /> Təkərciklə masalara yaxınlaşın
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <FaCube color="var(--primary)" /> <strong>2D / 3D</strong> düyməsi ilə baxış bucağını dəyişin
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Selected Seat Pass & Checkout Drawer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Selected Seat Details Card */}
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "24px",
            border: "1px solid var(--border-color)",
            padding: "24px",
            boxShadow: "var(--shadow-card)",
            position: "relative"
          }}>
            {/* Header info */}
            <div style={{
              background: "linear-gradient(135deg, var(--primary) 0%, #4a1525 100%)",
              borderRadius: "16px",
              padding: "18px",
              color: "#FFFFFF",
              marginBottom: "18px"
            }}>
              <span style={{
                fontSize: "0.72rem",
                background: "#E69A38",
                color: "#0F172A",
                padding: "2px 8px",
                borderRadius: "6px",
                fontWeight: 800,
                textTransform: "uppercase"
              }}>
                {selectedSeat.zone}
              </span>
              <h3 style={{ margin: "8px 0 2px 0", fontSize: "1.35rem", fontWeight: 800 }}>
                {selectedSeat.id}
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.9 }}>
                {selectedSeat.name}
              </p>
            </div>

            {/* Amenities List */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Masa və Zona Təchizatı:
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedSeat.amenities?.map((item, idx) => (
                  <div key={idx} style={{ fontSize: "0.84rem", color: "var(--text-body)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaCheck size={11} color="#10B981" /> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div style={{
              background: "var(--bg-main)",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: "20px",
              border: "1px dashed var(--border-color)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Rezervasiya Tarixi:</span>
                <strong style={{ color: "var(--text-title)" }}>{new Date(selectedDate).toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" })}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>İş Sessiyası:</span>
                <strong style={{ color: "var(--text-title)" }}>{selectedSlot.label}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", paddingTop: "6px", borderTop: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)" }}>Bron Qiyməti:</span>
                <strong style={{ color: "#10B981", fontWeight: 700 }}>ÖDƏNİŞSİZ (Üzvlük Daxilində)</strong>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: "var(--primary)",
                color: "#FFFFFF",
                fontSize: "0.98rem",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(123, 45, 74, 0.35)",
                transition: "all 0.25s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
              }}
            >
              <FaCalendarCheck /> {submitting ? "Təsdiqlənir..." : "Masanı Təsdiqlə və Bron Et"}
            </button>
          </div>

          {/* Active Reservations Mini Boarding Pass */}
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "24px",
            border: "1px solid var(--border-color)",
            padding: "24px",
            boxShadow: "var(--shadow-card)"
          }}>
            <h4 style={{ margin: "0 0 14px 0", fontSize: "1.05rem", color: "var(--text-title)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaQrcode color="var(--primary)" /> Aktiv Masa Buraxılış Vərəqələrim
            </h4>

            {myBookings.filter(b => b.status === "Confirmed").length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>
                Hazırda aktiv masa rezervasiyanız yoxdur.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "280px", overflowY: "auto" }}>
                {myBookings
                  .filter((b) => b.status === "Confirmed")
                  .map((b) => (
                    <div
                      key={b.bookingId}
                      style={{
                        padding: "12px 14px",
                        background: "var(--bg-main)",
                        borderRadius: "14px",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "0.9rem", color: "var(--text-title)", display: "block" }}>
                          {b.roomOrSeatNumber}
                        </strong>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                          <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <FaCalendarAlt size={11} color="var(--primary)" /> {new Date(b.bookingDate).toLocaleDateString("az-AZ")}
                          </span>
                          <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <FaClock size={11} color="#E69A38" /> {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelBooking(b.bookingId)}
                        title="Rezervasiyanı ləğv et"
                        style={{
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "none",
                          color: "#EF4444",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomBooking;
