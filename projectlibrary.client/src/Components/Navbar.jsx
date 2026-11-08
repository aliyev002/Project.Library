import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBookOpen, 
  FaBookmark, 
  FaHeart, 
  FaChair, 
  FaMoneyBillWave, 
  FaLightbulb, 
  FaSignOutAlt, 
  FaUserCircle,
  FaCube
} from 'react-icons/fa';
import logo from '../assets/logo.png';
import { useAuth } from '../Context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ onLogout }) => {
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
    { path: '/home', label: 'Kitablar', icon: <FaBookOpen /> },
    { path: '/dashboard', label: 'İcarələrim', icon: <FaBookmark /> },
    { path: '/wishlist', label: 'Sevimlilər', icon: <FaHeart /> },
    { path: '/room-booking', label: 'Masa Bron', icon: <FaChair />, badge: '3D' },
    { path: '/penalties', label: 'Cərimələr', icon: <FaMoneyBillWave /> },
    { path: '/suggestions', label: 'Təklif & İanə', icon: <FaLightbulb /> },
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '76px',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Brand Logo */}
      <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--primary) 0%, #4a1525 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(123, 45, 74, 0.3)'
        }}>
          <img 
            src={logo} 
            alt="Kitabxana" 
            style={{ height: '26px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontSize: '1.22rem', 
            fontWeight: 800, 
            color: 'var(--text-title)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15
          }}>
            Kitabxana<span style={{ color: 'var(--accent)' }}>.az</span>
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Rəqəmsal Oxucu Mərkəzi
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        background: 'var(--bg-main)',
        padding: '5px 8px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflowX: 'auto' 
      }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: active ? 700 : 500,
                color: active ? '#FFFFFF' : 'var(--text-body)',
                backgroundColor: active ? 'var(--primary)' : 'transparent',
                boxShadow: active ? '0 4px 12px rgba(123, 45, 74, 0.28)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
                position: 'relative'
              }}
            >
              <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  background: active ? '#E69A38' : 'rgba(230, 154, 56, 0.2)',
                  color: active ? '#0F172A' : '#E69A38',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  lineHeight: 1.2
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Actions, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ThemeToggle />
        <NotificationBell />

        <Link
          to="/profile"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '9px',
            padding: '6px 14px 6px 10px',
            background: 'var(--bg-main)',
            borderRadius: '24px',
            color: 'var(--text-title)',
            fontSize: '0.86rem',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid var(--border-color)',
            transition: 'all 0.2s'
          }}
          title="Şəxsi Hesab və Tənzimləmələr"
        >
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="Avatar" 
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}>
              {(user?.fullName || "O")[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.fullName?.split(' ')[0] || "Profil"}
          </span>
        </Link>

        <button
          onClick={handleLogoutClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Çıxış et"
        >
          <FaSignOutAlt />
          <span>Çıxış</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
