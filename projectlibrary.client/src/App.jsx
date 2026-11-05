import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Auth from './Pages/Auth';
import AdminDashboard from './Pages/AdminDashboard';
import AdminNavbar from './Components/AdminNavbar';
import Dashboard from './Pages/Dashboard';
import AdminReservation from './Pages/AdminReservation';
import AdminBorrow from './Pages/AdminBorrow';
import AboutMe from './Pages/AboutMe.components';
import Contact from './Pages/Contact.components';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const userRole = sessionStorage.getItem('role');
        setIsLoggedIn(!!token);
        setRole(userRole);
        setLoading(false);
    }, []);

    const handleLoginSuccess = (userRole) => {
        setIsLoggedIn(true);
        setRole(userRole);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setRole(null);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-main)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--primary)'
            }}>
                Yüklənir...
            </div>
        );
    }

    const isAdmin = isLoggedIn && role === 'Admin';

    return (
        <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
                {isLoggedIn && (
                    isAdmin ? (
                        <AdminNavbar onLogout={handleLogout} />
                    ) : (
                        <Navbar onLogout={handleLogout} />
                    )
                )}

                <main className={isAdmin ? 'admin-main-content' : (isLoggedIn ? 'user-main-content' : '')} style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<Navigate to={isLoggedIn ? (isAdmin ? "/admin-dashboard" : "/home") : "/login"} replace />} />
                        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="/register" element={isLoggedIn ? <Navigate to="/home" replace /> : <Auth />} />
                        
                        {/* User Routes */}
                        <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
                        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
                        <Route path="/aboutme" element={<AboutMe />} />
                        <Route path="/contact" element={<Contact />} />

                        {/* Admin Routes */}
                        <Route path="/admin-dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />
                        <Route path="/admin-borrow" element={isAdmin ? <AdminBorrow /> : <Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />
                        <Route path="/admin-reservation" element={isAdmin ? <AdminReservation /> : <Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>

                {(!isAdmin && isLoggedIn) && <Footer />}
            </div>
        </Router>
    );
};

export default App;
