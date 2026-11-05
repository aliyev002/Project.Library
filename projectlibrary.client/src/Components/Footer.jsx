import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaBookOpen } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border-color)',
      padding: '30px 40px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaBookOpen />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text-title)', fontSize: '1rem' }}>
            Kitabxana Portalı
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} Bütün hüquqlar qorunur.
          </span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.9rem' }}>
          <Link to="/home" style={{ color: 'var(--text-body)', fontWeight: 500 }}>
            Kitablar
          </Link>
          <Link to="/aboutme" style={{ color: 'var(--text-body)', fontWeight: 500 }}>
            Haqqımızda
          </Link>
          <Link to="/contact" style={{ color: 'var(--text-body)', fontWeight: 500 }}>
            Əlaqə
          </Link>
        </div>

        {/* Social */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {[
            { icon: <FaFacebookF />, href: 'https://facebook.com' },
            { icon: <FaInstagram />, href: 'https://instagram.com' },
            { icon: <FaTwitter />, href: 'https://twitter.com' },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-body)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)'
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
    </footer>
  );
};

export default Footer;
