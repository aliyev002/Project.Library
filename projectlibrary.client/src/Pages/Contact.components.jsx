import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaFacebookF, 
  FaInstagram, 
  FaPaperPlane 
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success("Məktubunuz uğurla göndərildi! Ən qısa zamanda sizinlə əlaqə saxlayacağıq.");
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
        <span style={{
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '14px'
        }}>
          Bizimlə Əlaqə
        </span>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-title)', marginBottom: '14px' }}>
          Sualınız və ya Təklifiniz Var?
        </h1>
        <p style={{ color: 'var(--text-body)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Kitabxana xidmətləri, icarə şərtləri və ya əməkdaşlıqla bağlı istənilən vaxt bizə müraciət edə bilərsiniz.
        </p>
      </div>

      {/* Contact Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        <div className="card-modern" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            marginBottom: '16px'
          }}>
            <FaPhoneAlt />
          </div>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Telefon</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Həftəiçi 09:00 - 18:00</p>
          <a href="tel:+994501234567" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem' }}>
            +994 (50) 123 45 67
          </a>
        </div>

        <div className="card-modern" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            marginBottom: '16px'
          }}>
            <FaEnvelope />
          </div>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Email</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Elektron müraciət üçün</p>
          <a href="mailto:info@kitabxana.az" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem' }}>
            info@kitabxana.az
          </a>
        </div>

        <div className="card-modern" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            marginBottom: '16px'
          }}>
            <FaMapMarkerAlt />
          </div>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Ünvan</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Mərkəzi filialımız</p>
          <span style={{ color: 'var(--text-title)', fontWeight: 600, fontSize: '1rem' }}>
            Bakı şəhəri, Nizami küç. 42
          </span>
        </div>

        <div className="card-modern" style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#FFFBEB',
            color: '#D97706',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            marginBottom: '16px'
          }}>
            <FaClock />
          </div>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>İş Rejimi</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Bazar ertəsi - Şənbə</p>
          <span style={{ color: 'var(--text-title)', fontWeight: 600, fontSize: '1rem' }}>
            09:00 - 20:00 (Bazar istirahət)
          </span>
        </div>
      </div>

      {/* Form and Map Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '32px',
        marginBottom: '60px'
      }}>
        {/* Contact Form */}
        <div className="card-modern" style={{ padding: '36px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Bizə İsmarıc Göndərin</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
            Formu doldurun, nümayəndələrimiz ən qısa müddətdə sizə cavab versin.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Adınız və Soyadınız</label>
              <input
                type="text"
                required
                placeholder="Məs: Rəşad Quliyev"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-modern"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Email Ünvanınız</label>
              <input
                type="email"
                required
                placeholder="adiniz@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-modern"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Mövzu</label>
              <input
                type="text"
                required
                placeholder="Məs: Kitab icarəsi haqqında sual"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-modern"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Mesajınız</label>
              <textarea
                rows={4}
                required
                placeholder="Məzmunu bura qeyd edin..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-modern"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sent}
              className="btn-primary-custom"
              style={{ width: '100%', padding: '12px' }}
            >
              <FaPaperPlane /> {sent ? 'Göndərildi' : 'Mesajı Göndər'}
            </button>
          </form>
        </div>

        {/* Map and Socials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card-modern" style={{ overflow: 'hidden', height: '360px' }}>
            <iframe
              title="Kitabxana Lokasiyası"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.707372202008!2d49.851612715368576!3d40.377194979368224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307db2030e3c87%3A0xc428d18d0b57a9d!2sBaku!5e0!3m2!1sen!2saz!4v1684320678784!5m2!1sen!2saz"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

          <div className="card-modern" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h5 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-title)' }}>Bizi Sosial Şəbəkələrdə İzləyin</h5>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Yeniliklərdən dərhal xəbərdar olun</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href="https://facebook.com/kitabxana"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
              >
                <FaFacebookF />
              </a>
              <a
                href="https://instagram.com/kitabxana"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
