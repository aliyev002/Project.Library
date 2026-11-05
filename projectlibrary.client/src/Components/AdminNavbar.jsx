import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaExchangeAlt, FaClipboardList, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import logo from '../assets/logo.png';

const AdminNavbar = ({ onLogout, setIsLoggedIn }) => {
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
    { path: '/admin-dashboard', label: 'Kitablar', icon: <FaBook /> },
    { path: '/admin-borrow', label: 'İcarəyə Verilənlər', icon: <FaExchangeAlt /> },
    { path: '/admin-reservation', label: 'Rezervasiyalar', icon: <FaClipboardList /> },
  ];

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      width: '260px',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      backgroundColor: '#1E232E',
      color: '#FFFFFF',
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      padding: '24px 16px',
      justifyContent: 'space-between'
    }}>
      {/* Top Header */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          marginBottom: '30px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ width: '42px', height: '42px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
          />
          <div>
            <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Kitabxana
            </h5>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--accent)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <FaShieldAlt /> İdarəetmə Paneli
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  boxShadow: active ? '0 4px 14px rgba(123, 45, 74, 0.35)' : 'none',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem', color: active ? 'var(--accent)' : 'inherit' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom User info & Logout */}
      <div style={{
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            A
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
              Administrator
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>
              admin@kitabxana.az
            </p>
          </div>
        </div>

        <button
          onClick={handleLogoutClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '11px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#F87171',
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
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#F87171';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
        >
          <FaSignOutAlt />
          <span>Sistemdən Çıxış</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar;
