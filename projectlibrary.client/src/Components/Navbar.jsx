import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBookOpen, FaBookmark, FaInfoCircle, FaEnvelope, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Navbar = ({ onLogout, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else if (setIsLoggedIn) {
      sessionStorage.clear();
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
    navigate('/login');
  };

  const navItems = [
    { path: '/home', label: 'Kitablar', icon: <FaBookOpen /> },
    { path: '/dashboard', label: 'İcarələrim', icon: <FaBookmark /> },
    { path: '/aboutme', label: 'Haqqımızda', icon: <FaInfoCircle /> },
    { path: '/contact', label: 'Əlaqə', icon: <FaEnvelope /> },
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px'
    }}>
      {/* Brand Logo */}
      <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src={logo} 
          alt="Kitabxana" 
          style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            Kitabxana
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Oxucu Portalı
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: active ? 700 : 500,
                color: active ? '#FFFFFF' : 'var(--text-body)',
                backgroundColor: active ? 'var(--primary)' : 'transparent',
                boxShadow: active ? '0 4px 12px rgba(123, 45, 74, 0.25)' : 'none',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  e.currentTarget.style.color = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-body)';
                }
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Actions / Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '6px 14px',
          background: 'var(--primary-light)',
          borderRadius: 'var(--radius-pill)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <FaUserCircle style={{ fontSize: '1.2rem' }} />
          <span>Oxucu</span>
        </div>

        <button
          onClick={handleLogoutClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            padding: '9px 18px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DC2626';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = '#DC2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FEE2E2';
            e.currentTarget.style.color = '#DC2626';
            e.currentTarget.style.borderColor = '#FECACA';
          }}
        >
          <FaSignOutAlt />
          <span>Çıxış</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
