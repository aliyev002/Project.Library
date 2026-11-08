import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaBookOpen, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaChair,
  FaHeart
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      padding: '48px 28px 24px 28px',
      marginTop: 'auto',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '36px',
        marginBottom: '40px'
      }}>
        {/* Col 1: Brand & Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(123, 45, 74, 0.25)'
            }}>
              <FaBookOpen size={16} />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-title)', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              Kitabxana<span style={{ color: 'var(--accent)' }}>.az</span>
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            Müasir rəqəmsal oxucu platforması. Minlərlə kitab, elektron PDF resursları və 3D oxu zalı ilə bilik əldə etməyi asanlaşdırırıq.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[
              { icon: <FaFacebookF size={13} />, href: 'https://facebook.com' },
              { icon: <FaInstagram size={13} />, href: 'https://instagram.com' },
              { icon: <FaTwitter size={13} />, href: 'https://twitter.com' },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                  e.currentTarget.style.color = 'var(--text-body)';
                }}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '16px', letterSpacing: '0.02em' }}>
            Sürətli Keçidlər
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <Link to="/home" style={{ color: 'var(--text-body)', transition: 'all 0.2s' }}>
              📚 Kitab Kataloqu
            </Link>
            <Link to="/room-booking" style={{ color: 'var(--text-body)', transition: 'all 0.2s' }}>
              🪑 3D Masa və Kabinə Bronu
            </Link>
            <Link to="/dashboard" style={{ color: 'var(--text-body)', transition: 'all 0.2s' }}>
              🔖 Şəxsi İcarələrim & Hədəflər
            </Link>
            <Link to="/wishlist" style={{ color: 'var(--text-body)', transition: 'all 0.2s' }}>
              ❤️ Sevimli Əsərlər Siyahısı
            </Link>
            <Link to="/suggestions" style={{ color: 'var(--text-body)', transition: 'all 0.2s' }}>
              💡 Yeni Kitab Təklifi və İanə
            </Link>
          </div>
        </div>

        {/* Col 3: Work Hours */}
        <div>
          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '16px', letterSpacing: '0.02em' }}>
            İş Rejimi & Zallar
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-body)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaClock color="var(--primary)" /> Həftə içi: 09:00 - 22:30
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaClock color="var(--primary)" /> Şənbə - Bazar: 10:00 - 20:00
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChair color="#E69A38" /> 3D Oxu Zalı: 24/7 (Rezervasiya ilə)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBookOpen color="#10B981" /> Rəqəmsal Kitabxana: 24/7 Açıqdır
            </div>
          </div>
        </div>

        {/* Col 4: Contact & Location */}
        <div>
          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '16px', letterSpacing: '0.02em' }}>
            Əlaqə Məlumatları
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-body)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaMapMarkerAlt color="var(--primary)" /> Bakı şəhəri, İstiqlaliyyət küç. 24
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaPhoneAlt color="var(--primary)" /> +994 (12) 492-00-00
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaEnvelope color="var(--primary)" /> info@kitabxana.az
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.84rem',
        color: 'var(--text-muted)'
      }}>
        <span>&copy; {new Date().getFullYear()} Kitabxana.az • Bütün hüquqlar qorunur.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/aboutme" style={{ color: 'inherit' }}>Haqqımızda</Link>
          <Link to="/contact" style={{ color: 'inherit' }}>Əlaqə</Link>
          <Link to="/home" style={{ color: 'inherit' }}>Məxfilik Siyasəti</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
