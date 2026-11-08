import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBook, 
  FaExchangeAlt, 
  FaClipboardList, 
  FaMoneyBillWave, 
  FaChair, 
  FaLightbulb, 
  FaShieldAlt, 
  FaUserCog, 
  FaSignOutAlt,
  FaUserShield,
  FaChartLine
} from 'react-icons/fa';
import logo from '../assets/logo.png';
import { useAuth } from '../Context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const AdminNavbar = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
    navigate('/login');
  };

  const navItems = [
    { path: '/admin-dashboard', label: 'Kitablar Fondu', icon: <FaBook /> },
    { path: '/admin-borrow', label: 'İcarə Qeydləri', icon: <FaExchangeAlt /> },
    { path: '/admin-reservation', label: 'Rezervasiyalar', icon: <FaClipboardList /> },
    { path: '/penalties', label: 'Cərimə Nəzarəti', icon: <FaMoneyBillWave /> },
    { path: '/room-booking', label: '3D Masa Rezervləri', icon: <FaChair />, badge: '3D' },
    { path: '/suggestions', label: 'Təklif & İanələr', icon: <FaLightbulb /> },
    { path: '/admin-audit', label: 'Audit Loqları & CSV', icon: <FaShieldAlt /> },
    { path: '/profile', label: 'İnzibatçı Profili', icon: <FaUserCog /> },
  ];

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      width: '264px',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      backgroundColor: 'var(--bg-sidebar, #1E232E)',
      color: '#FFFFFF',
      boxShadow: '4px 0 25px rgba(0, 0, 0, 0.18)',
      zIndex: 1000,
      padding: '24px 18px',
      justifyContent: 'space-between',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Top Header */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 4px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4a1525 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(123, 45, 74, 0.35)'
            }}>
              <img 
                src={logo} 
                alt="Logo" 
                style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
              />
            </div>
            <div>
              <h5 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.08rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Kitabxana<span style={{ color: 'var(--accent)' }}>.az</span>
              </h5>
              <span style={{ fontSize: '0.68rem', color: '#E69A38', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                İDARƏETMƏ PANELİ
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ThemeToggle />
            <NotificationBell isAdminSidebar={true} />
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  boxShadow: active ? '0 4px 14px rgba(123, 45, 74, 0.35)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.05rem', color: active ? '#FFFFFF' : '#64748B' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: active ? '#E69A38' : 'rgba(230, 154, 56, 0.25)',
                    color: active ? '#0F172A' : '#F6C177',
                    padding: '1px 6px',
                    borderRadius: '8px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px',
          padding: '8px 10px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <FaUserShield size={24} color="#E69A38" />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.fullName || "İnzibatçı"}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{user?.email || "admin@kitabxana.az"}</span>
          </div>
        </div>

        <button
          onClick={handleLogoutClick}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#F87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
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
