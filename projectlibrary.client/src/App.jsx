import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Auth from "./Pages/Auth";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminNavbar from "./Components/AdminNavbar";
import Dashboard from "./Pages/Dashboard";
import AdminReservation from "./Pages/AdminReservation";
import AdminBorrow from "./Pages/AdminBorrow";
import AboutMe from "./Pages/AboutMe.components";
import Contact from "./Pages/Contact.components";
import Wishlist from "./Pages/Wishlist";
import Penalties from "./Pages/Penalties";
import BookSuggestions from "./Pages/BookSuggestions";
import RoomBooking from "./Pages/RoomBooking";
import Profile from "./Pages/Profile";
import AdminAudit from "./Pages/AdminAudit";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { isLoggedIn, role, loading, logout } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-main)",
          fontSize: "1.2rem",
          fontWeight: 600,
          color: "var(--primary)",
        }}
      >
        Yüklənir...
      </div>
    );
  }

  const isAdmin = isLoggedIn && role === "Admin";

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        limit={4}
      />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg-main)",
        }}
      >
        {isLoggedIn && (isAdmin ? <AdminNavbar onLogout={logout} /> : <Navbar onLogout={logout} />)}

        <main
          className={isAdmin ? "admin-main-content" : isLoggedIn ? "user-main-content" : ""}
          style={{ flex: 1, paddingTop: isAdmin ? 0 : "75px" }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  to={isLoggedIn ? (isAdmin ? "/admin-dashboard" : "/home") : "/login"}
                  replace
                />
              }
            />
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to={isAdmin ? "/admin-dashboard" : "/home"} replace />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/register"
              element={isLoggedIn ? <Navigate to="/home" replace /> : <Auth />}
            />

            {/* General Authenticated Routes */}
            <Route
              path="/home"
              element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/dashboard"
              element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/wishlist"
              element={isLoggedIn ? <Wishlist /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/penalties"
              element={isLoggedIn ? <Penalties /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/suggestions"
              element={isLoggedIn ? <BookSuggestions /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/room-booking"
              element={isLoggedIn ? <RoomBooking /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profile"
              element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />}
            />

            <Route path="/aboutme" element={<AboutMe />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={isAdmin ? <AdminDashboard /> : <Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
            />
            <Route
              path="/admin-borrow"
              element={isAdmin ? <AdminBorrow /> : <Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
            />
            <Route
              path="/admin-reservation"
              element={isAdmin ? <AdminReservation /> : <Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
            />
            <Route
              path="/admin-audit"
              element={isAdmin ? <AdminAudit /> : <Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isAdmin && isLoggedIn && <Footer />}
      </div>
    </Router>
  );
};

export default App;
