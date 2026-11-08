import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { FaBell, FaCheckDouble, FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from "../Api/featuresApi";
import { useAuth } from "../Context/AuthContext";
import { startSignalRConnection } from "../services/signalrService";
import { toast } from "react-toastify";

const NotificationBell = ({ isAdminSidebar = false }) => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread'
  const [dropdownPos, setDropdownPos] = useState({ top: 70, left: "auto", right: 20 });

  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const currentUserId = user?.id || sessionStorage.getItem("userId");

  useEffect(() => {
    loadNotifications();

    if (currentUserId) {
      startSignalRConnection(currentUserId, role, (newNotif) => {
        const item = {
          notificationId: newNotif.notificationId || newNotif.NotificationId || Date.now(),
          title: newNotif.title || newNotif.Title || "Bildiriş",
          message: newNotif.message || newNotif.Message || "",
          type: newNotif.type || newNotif.Type || "Info",
          isRead: false,
          createdAt: newNotif.createdAt || newNotif.CreatedAt || new Date().toISOString(),
        };

        setNotifications((prev) => [item, ...prev]);

        // Modern pop toast with title and message
        const title = item.title;
        const message = item.message;
        const toastContent = (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "inherit" }}>{title}</span>
            <span style={{ fontSize: "0.84rem", opacity: 0.9, lineHeight: 1.4 }}>{message}</span>
          </div>
        );

        if (item.type === "Success") {
          toast.success(toastContent, { autoClose: 5000 });
        } else if (item.type === "Warning") {
          toast.warning(toastContent, { autoClose: 5000 });
        } else {
          toast.info(toastContent, { autoClose: 5000 });
        }
      });
    }

    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUserId, role]);

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // səssiz
    }
  };

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      setDropdownPos({
        top: Math.max(12, rect.bottom + 8),
        left: 12,
        right: 12,
        width: "calc(100vw - 24px)",
      });
      return;
    }

    if (isAdminSidebar || rect.left < 280) {
      // Admin sidebar üçün: sidebar 260px genişliyindədir.
      // Popover sidebar-ın dərhal sağında görünür.
      const leftPos = Math.min(272, window.innerWidth - 380);
      const topPos = Math.min(Math.max(16, rect.top - 6), window.innerHeight - 500);
      setDropdownPos({
        top: Math.max(14, topPos),
        left: Math.max(14, leftPos),
        right: "auto",
        width: "360px",
      });
    } else {
      // Normal yuxarı navbar üçün
      const rightPos = Math.max(16, window.innerWidth - rect.right);
      setDropdownPos({
        top: rect.bottom + 10,
        left: "auto",
        right: rightPos,
        width: "360px",
      });
    }
  };

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      // Əgər düymə və ya popover-in özünə kliklənibsə, bağlama
      if (
        (buttonRef.current && buttonRef.current.contains(e.target)) ||
        (popoverRef.current && popoverRef.current.contains(e.target))
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const handleResize = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [open, isAdminSidebar]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!open) {
      updatePosition();
    }
    setOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Bildiriş oxundu edilərkən xəta:", err);
    }
  };

  const handleMarkAllRead = async (e) => {
    if (e) e.stopPropagation();
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Bütün bildirişlər oxundu edilərkən xəta:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications =
    activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const getTypeIcon = (type) => {
    if (type === "Success") {
      return <FaCheckCircle color="#10B981" size={15} style={{ flexShrink: 0 }} />;
    }
    if (type === "Warning") {
      return <FaExclamationTriangle color="#F59E0B" size={15} style={{ flexShrink: 0 }} />;
    }
    return <FaInfoCircle color="#3B82F6" size={15} style={{ flexShrink: 0 }} />;
  };

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Bildirişlər"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "8px",
          color: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          borderRadius: "10px",
          transition: "var(--transition)",
          outline: "none",
        }}
        title="Bildirişlər"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              background: "#ef4444",
              color: "white",
              fontSize: "0.68rem",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.5)",
              animation: "pulseNotification 2s infinite",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="notification-popover-portal"
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left !== "auto" ? dropdownPos.left : undefined,
              right: dropdownPos.right !== "auto" ? dropdownPos.right : undefined,
              width: dropdownPos.width || "360px",
              maxHeight: "500px",
              backgroundColor: "var(--bg-card, #ffffff)",
              color: "var(--text-title, #1f2937)",
              boxShadow:
                "0 20px 45px -10px rgba(15, 23, 42, 0.35), 0 0 0 1px var(--border-color, rgba(0,0,0,0.08))",
              borderRadius: "16px",
              zIndex: 999999,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              animation: "slideInPopover 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-color, #e5e7eb)",
                background: "var(--bg-main, #f8fafc)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaBell size={15} color="var(--primary, #7B2D4A)" />
                <strong style={{ fontSize: "0.98rem", color: "var(--text-title)" }}>
                  Bildirişlər
                </strong>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "white",
                      fontSize: "0.7rem",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount} yeni
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary, #3b82f6)",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 600,
                      padding: "4px 6px",
                      borderRadius: "6px",
                    }}
                    title="Bütün bildirişləri oxundu kimi işarələ"
                  >
                    <FaCheckDouble size={11} /> Hamısını oxu
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted, #94a3b8)",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Bağla"
                >
                  <FaTimes size={13} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                padding: "8px 16px",
                gap: "8px",
                borderBottom: "1px solid var(--border-color, #f1f5f9)",
                background: "var(--bg-card, #ffffff)",
              }}
            >
              <button
                onClick={() => setActiveTab("all")}
                style={{
                  border: "none",
                  background: activeTab === "all" ? "var(--primary-light, #fdf2f5)" : "transparent",
                  color: activeTab === "all" ? "var(--primary, #7B2D4A)" : "var(--text-muted, #64748b)",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Hamısı ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                style={{
                  border: "none",
                  background: activeTab === "unread" ? "var(--primary-light, #fdf2f5)" : "transparent",
                  color: activeTab === "unread" ? "var(--primary, #7B2D4A)" : "var(--text-muted, #64748b)",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Oxunmamış ({unreadCount})
              </button>
            </div>

            {/* Notifications List */}
            <div style={{ overflowY: "auto", flex: 1, maxHeight: "380px" }}>
              {filteredNotifications.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "var(--text-muted, #94a3b8)",
                    fontSize: "0.88rem",
                  }}
                >
                  <FaBell size={28} style={{ opacity: 0.3, marginBottom: "8px", display: "block", margin: "0 auto 8px auto" }} />
                  {activeTab === "unread" ? "Oxunmamış bildirişiniz yoxdur." : "Heç bir bildiriş tapılmadı."}
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const id = n.notificationId || n.NotificationId;
                  const title = n.title || n.Title;
                  const message = n.message || n.Message;
                  const type = n.type || n.Type;
                  const isRead = n.isRead !== undefined ? n.isRead : n.IsRead;
                  const createdAt = n.createdAt || n.CreatedAt;

                  return (
                    <div
                      key={id}
                      onClick={(e) => !isRead && handleMarkAsRead(id, e)}
                      style={{
                        padding: "12px 18px",
                        borderBottom: "1px solid var(--border-color, #f1f5f9)",
                        background: isRead ? "transparent" : "rgba(123, 45, 74, 0.05)",
                        cursor: isRead ? "default" : "pointer",
                        transition: "background 0.2s",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        position: "relative",
                      }}
                    >
                      {/* Left icon */}
                      <div style={{ marginTop: "2px" }}>{getTypeIcon(type)}</div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: "3px",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: isRead ? 600 : 700,
                              fontSize: "0.88rem",
                              color: "var(--text-title)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {title}
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-muted)",
                              flexShrink: 0,
                            }}
                          >
                            {createdAt
                              ? new Date(createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.82rem",
                            color: "var(--text-body)",
                            lineHeight: 1.45,
                            wordBreak: "break-word",
                          }}
                        >
                          {message}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!isRead && (
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "var(--primary, #7B2D4A)",
                            marginTop: "6px",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default NotificationBell;
