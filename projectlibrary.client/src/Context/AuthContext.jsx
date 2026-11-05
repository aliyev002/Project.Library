import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
            try {
                setUser(jwtDecode(token));
            } catch (err) {
                console.error("Token decode error:", err);
            }
        }
    }, []);

    const login = (token) => {
        sessionStorage.setItem("token", token);
        localStorage.setItem("token", token);
        try {
            setUser(jwtDecode(token));
        } catch (err) {
            console.error("Token decode error:", err);
        }
    };

    const logout = () => {
        sessionStorage.clear();
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
