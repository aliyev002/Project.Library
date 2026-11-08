import React, { useState, useEffect } from "react";
import { FaUser, FaPhone, FaLock, FaCamera, FaSave } from "react-icons/fa";
import { getMyProfile, updateMyProfile, uploadImageFile } from "../Api/featuresApi";
import { toast, ToastContainer } from "react-toastify";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    avatarUrl: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
        avatarUrl: data.avatarUrl || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      toast.error("Profil məlumatları yüklənə bilmədi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const res = await uploadImageFile(file);
      if (res?.url) {
        // Dərhal profildə yenilə və bazaya yaz
        await updateMyProfile({
          fullName: formData.fullName || profile?.fullName,
          avatarUrl: res.url,
        });
        setFormData((prev) => ({ ...prev, avatarUrl: res.url }));
        setProfile((prev) => ({ ...prev, avatarUrl: res.url }));
        toast.success("Profil şəkli uğurla yeniləndi!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Şəkil yüklənərkən xəta baş verdi. Zəhmət olmasa JPG/PNG faylı seçin.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.warning("Yeni şifrələr üst-üstə düşmür.");
        return;
      }
      if (!formData.currentPassword) {
        toast.warning("Cari şifrənizi daxil etməlisiniz.");
        return;
      }
    }

    setSaving(true);
    try {
      await updateMyProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        avatarUrl: formData.avatarUrl,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined,
      });
      toast.success("Profil uğurla yeniləndi!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      await loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Profil yenilənərkən xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>Yüklənir...</div>;
  }

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", padding: "0 20px" }}>
      <ToastContainer position="bottom-right" />
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2 style={{ margin: "0 0 24px 0", color: "var(--text-title)", fontSize: "1.8rem" }}>
          Şəxsi Profil Tənzimləmələri
        </h2>

        {/* Avatar Bölməsi */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
          <div style={{ position: "relative" }}>
            <img
              src={
                formData.avatarUrl ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              }
              alt="Avatar"
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #3b82f6",
                backgroundColor: "#e2e8f0"
              }}
            />
            <label
              htmlFor="avatar-upload"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "#3b82f6",
                color: "white",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: avatarUploading ? "wait" : "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
              title="Şəkli dəyişdir"
            >
              <FaCamera size={14} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              disabled={avatarUploading}
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "var(--text-title)", fontSize: "1.2rem" }}>
              {profile?.fullName || "İstifadəçi"}
            </h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{profile?.email}</span>
            <div style={{ marginTop: "6px" }}>
              <span
                style={{
                  background: "var(--primary-light, #e0f2fe)",
                  color: "var(--primary, #0369a1)",
                  padding: "3px 10px",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Rol: {profile?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-title)", marginBottom: "6px" }}>
              <FaUser color="#3b82f6" /> Tam Adınız
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-main)",
                color: "var(--text-title)",
              }}
            />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-title)", marginBottom: "6px" }}>
              <FaPhone color="#3b82f6" /> Əlaqə Nömrəsi
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+994 50 123 45 67"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-main)",
                color: "var(--text-title)",
              }}
            />
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color)", margin: "10px 0" }} />

          <h4 style={{ margin: "0", color: "var(--text-title)" }}>Şifrə Dəyişdir (İstəyə bağlı)</h4>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-body)", marginBottom: "6px" }}>
              <FaLock color="#64748b" /> Cari Şifrə
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-main)",
                color: "var(--text-title)",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-body)", marginBottom: "6px" }}>
                Yeni Şifrə
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-main)",
                  color: "var(--text-title)",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-body)", marginBottom: "6px" }}>
                Yeni Şifrə Təkrarı
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-main)",
                  color: "var(--text-title)",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || avatarUploading}
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#3b82f6",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <FaSave /> {saving ? "Yadda saxlanılır..." : "Dəyişiklikləri Saxla"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
