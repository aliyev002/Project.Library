import React from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaAward, FaUsers, FaLaptopCode, FaArrowRight } from 'react-icons/fa';

const AboutMe = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '40px',
        marginBottom: '60px'
      }}>
        <div style={{ flex: '1 1 500px' }}>
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
            marginBottom: '16px'
          }}>
            Haqqımızda
          </span>
          <h1 style={{ fontSize: '2.6rem', color: 'var(--text-title)', lineHeight: 1.2, marginBottom: '20px' }}>
            Bilik və Mədəniyyəti Birləşdirən Müasir Kitabxana
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: 1.7, marginBottom: '16px' }}>
            Kitabxanamız oxuculara zəngin və ən müasir kitab kolleksiyası təqdim edərək, maarifləndirici, 
            ilhamverici və yaradıcı intellektual mühit formalaşdırmağı qarşısına məqsəd qoymuşdur.
          </p>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: 1.7, marginBottom: '24px' }}>
            Klassik dünya ədəbiyyatından ən son elmi-texniki nəşrlərə qədər minlərlə resursa asanlıqla 
            çıxış əldə edə, innovativ rəqəmsal axtarış və icarə sistemimiz vasitəsilə mütaliə prosesini asanlaşdıra bilərsiniz.
          </p>
          <Link to="/contact" className="btn-primary-custom" style={{ padding: '12px 28px' }}>
            Bizimlə Əlaqə Saxlayın <FaArrowRight />
          </Link>
        </div>

        <div style={{ flex: '1 1 450px', position: 'relative' }}>
          <img
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop"
            alt="Kitabxana Salonu"
            style={{
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              objectFit: 'cover',
              maxHeight: '440px'
            }}
          />
        </div>
      </div>

      {/* Value Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '60px'
      }}>
        <div className="card-modern" style={{ padding: '30px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            marginBottom: '18px'
          }}>
            <FaBookOpen />
          </div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Zəngin Ədəbiyyat</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            Hər janrda minlərlə yerli və xarici müəlliflərin nadir nüsxələrini özündə birləşdirən zəngin fond.
          </p>
        </div>

        <div className="card-modern" style={{ padding: '30px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            marginBottom: '18px'
          }}>
            <FaLaptopCode />
          </div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Rəqəmsal İdarəetmə</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            Kitabları bir toxunuşla axtarmaq, icarəyə götürmək və təhvil tarixlərini onlayn izləmək imkanı.
          </p>
        </div>

        <div className="card-modern" style={{ padding: '30px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            marginBottom: '18px'
          }}>
            <FaUsers />
          </div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Oxucu İcması</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            Kitabsevərlər üçün yaradılmış rahat oxu mühiti və intellektual inkişaf platforması.
          </p>
        </div>

        <div className="card-modern" style={{ padding: '30px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#FFFBEB',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            marginBottom: '18px'
          }}>
            <FaAward />
          </div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Keyfiyyət və Etibar</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            Hər bir oxucuya fərdi yanaşma və etibarlı xidmət təminatı ilə oxu təcrübənizi zənginləşdiririk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
