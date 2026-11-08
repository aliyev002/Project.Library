import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const savedRole = sessionStorage.getItem("role") || localStorage.getItem("role");
      const savedUserId = sessionStorage.getItem("userId") || localStorage.getItem("userId");
      const savedEmail = sessionStorage.getItem("email") || localStorage.getItem("email");
      const savedFullName = sessionStorage.getItem("fullName") || localStorage.getItem("fullName");

      if (token) {
        let decoded = null;
        try {
          decoded = jwtDecode(token);
        } catch {
          // Token invalid or expired
        }

        const effectiveRole = savedRole || decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded?.role || "User";
        const effectiveId = savedUserId || decoded?.sub || decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

        setUser({
          id: effectiveId,
          email: savedEmail || decoded?.email,
          fullName: savedFullName || decoded?.name || "İstifadəçi",
          role: effectiveRole,
        });
        setRole(effectiveRole);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setRole(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    sessionStorage.setItem("token", token);
    localStorage.setItem("token", token);

    let decoded = null;
    try {
      decoded = jwtDecode(token);
    } catch {
      // Ignored
    }

    const effectiveRole = userData?.role || decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded?.role || "User";
    const effectiveId = userData?.id || decoded?.sub || decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const effectiveEmail = userData?.email || decoded?.email;
    const effectiveFullName = userData?.fullName || decoded?.name || "İstifadəçi";

    sessionStorage.setItem("role", effectiveRole);
    sessionStorage.setItem("userId", effectiveId);
    sessionStorage.setItem("email", effectiveEmail || "");
    sessionStorage.setItem("fullName", effectiveFullName || "");

    setUser({
      id: effectiveId,
      email: effectiveEmail,
      fullName: effectiveFullName,
      role: effectiveRole,
    });
    setRole(effectiveRole);
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setUser(null);
    setRole(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
